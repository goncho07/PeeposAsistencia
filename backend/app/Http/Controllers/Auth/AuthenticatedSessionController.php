<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\ActivityLog;
use App\Models\User;
use App\Traits\LogsActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;


class AuthenticatedSessionController extends Controller
{
    use LogsActivity;
    
    /**
     * Handle login request
     * 
     * POST /api/auth/login
     * 
     * @param LoginRequest $request
     * @return JsonResponse
     */
    public function login(LoginRequest $request): JsonResponse
    {
        app()->forgetInstance('current_tenant');
        app()->forgetInstance('current_tenant_id');

        $credentials = $request->validated();

        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }

        if ($request->has('tenant_slug') && $request->tenant_slug) {
            $tenant = \App\Models\Tenant::where('slug', $request->tenant_slug)->first();

            if (!$tenant) {
                return response()->json([
                    'message' => 'Institución no encontrada.',
                ], 404);
            }

            if ($user->tenant_id !== $tenant->id) {
                return response()->json([
                    'message' => 'No tienes acceso a esta institución. Verifica tus credenciales.',
                ], 403);
            }
        }

        if ($user->status !== 'ACTIVO') {
            return response()->json([
                'message' => 'Tu cuenta está inactiva. Contacta al administrador.',
            ], 403);
        }

        if (!$user->tenant || !$user->tenant->is_active) {
            return response()->json([
                'message' => 'Tu institución está inactiva. Contacta al soporte.',
                'error' => 'TENANT_INACTIVE',
            ], 403);
        }

        $deviceName = $request->input('device_name', 'api-client');
        $expiresAt = $request->input('remember_me', false)
            ? now()->addDays(90)
            : now()->addDays(30);
        $token = $user->createToken($deviceName, ['*'], $expiresAt);

        $ip = client_ip();

        $token->accessToken->update([
            'ip_address' => $ip,
        ]);

        $user->updateLastLogin($ip);

        $this->logActivity('user_login', null, [
            'ip_address' => $ip,
            'user_agent' => $request->userAgent(),
        ], $user);

        return response()->json([
            'message' => 'Inicio de sesión exitoso',
            'access_token' => $token->plainTextToken,
            'token_type' => 'Bearer',
            'expires_at' => $token->accessToken->expires_at,
            'user' => [
                'id' => $user->id,
                'name' => $user->full_name,
                'email' => $user->email,
                'role' => $user->role,
                'tenant_id' => $user->tenant_id,
                'tenant' => [
                    'id' => $user->tenant->id,
                    'name' => $user->tenant->name,
                    'code' => $user->tenant->code,
                    'ugel' => $user->tenant->ugel,
                    'slug' => $user->tenant->slug,
                    'logo_url' => get_storage_url($user->tenant->logo_url),
                    'banner_url' => get_storage_url($user->tenant->banner_url),
                    'background_url' => get_storage_url($user->tenant->background_url),
                ],
            ],
        ], 200);
    }

    /**
     * Handle logout request
     * 
     * POST /api/auth/logout
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        $this->logActivity('user_logout', null, [
            'ip_address' => client_ip(),
        ], $user);

        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada exitosamente',
        ], 200);
    }

    /**
     * Logout from all devices
     * 
     * POST /api/auth/logout-all
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function logoutAll(Request $request): JsonResponse
    {
        $user = $request->user();
        $tokensCount = $user->tokens()->count();
        
        $this->logActivity('user_logout_all_devices', null, [
            'ip_address' => $request->ip(),
            'tokens_revoked' => $tokensCount,
        ], $user);

        $user->tokens()->delete();

        return response()->json([
            'message' => 'Sesión cerrada en todos los dispositivos',
        ], 200);
    }

    /**
     * Get authenticated user information
     * 
     * GET /api/auth/user
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function user(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->full_name,
                'first_name' => $user->name,
                'paternal_surname' => $user->paternal_surname,
                'maternal_surname' => $user->maternal_surname,
                'email' => $user->email,
                'dni' => $user->dni,
                'role' => $user->role,
                'status' => $user->status,
                'phone_number' => $user->phone_number,
                'avatar_url' => $user->avatar_url,
                'last_login_at' => $user->last_login_at,
                'tenant_id' => $user->tenant_id,
                'tenant' => [
                    'id' => $user->tenant->id,
                    'name' => $user->tenant->name,
                    'code' => $user->tenant->code,
                    'slug' => $user->tenant->slug,
                    'logo_url' => get_storage_url($user->tenant->logo_url),
                    'banner_url' => get_storage_url($user->tenant->banner_url),
                    'background_url' => get_storage_url($user->tenant->background_url),
                    'institution_type' => $user->tenant->institution_type,
                    'level' => $user->tenant->level,
                    'timezone' => $user->tenant->timezone,
                ],
            ],
        ], 200);
    }

    /**
     * Refresh token
     * 
     * POST /api/auth/refresh
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function refresh(Request $request): JsonResponse
    {
        $user = $request->user();
        $currentToken = $request->user()->currentAccessToken();

        $deviceName = $currentToken->name ?? 'api-client';
        $ipAddress = $currentToken->ip_address ?? client_ip();

        $currentToken->delete();

        $token = $user->createToken($deviceName, ['*'], now()->addDays(30));

        $token->accessToken->update([
            'ip_address' => $ipAddress,
        ]);

        $this->logActivity('token_refreshed', null, [
            'ip_address' => $request->ip(),
        ], $user);

        return response()->json([
            'message' => 'Token renovado exitosamente',
            'access_token' => $token->plainTextToken,
            'token_type' => 'Bearer',
            'expires_at' => $token->accessToken->expires_at,
        ], 200);
    }

    /**
     * Get all active tokens/sessions
     * 
     * GET /api/auth/sessions
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function sessions(Request $request): JsonResponse
    {
        $user = $request->user();

        $tokens = $user->tokens()->get()->map(function ($token) use ($request) {
            return [
                'id' => $token->id,
                'name' => $token->name,
                'ip_address' => $token->ip_address,
                'last_used_at' => $token->last_used_at,
                'expires_at' => $token->expires_at,
                'is_current' => $token->id === $request->user()->currentAccessToken()->id,
            ];
        });

        return response()->json([
            'sessions' => $tokens,
        ], 200);
    }

    /**
     * Revoke a specific token/session
     * 
     * DELETE /api/auth/sessions/{tokenId}
     * 
     * @param Request $request
     * @param int $tokenId
     * @return JsonResponse
     */
    public function revokeSession(Request $request, int $tokenId): JsonResponse
    {
        $user = $request->user();

        $token = $user->tokens()->find($tokenId);

        if (!$token) {
            return response()->json([
                'message' => 'Token no encontrado',
            ], 404);
        }
        
        if ($token->id === $request->user()->currentAccessToken()->id) {
            return response()->json([
                'message' => 'No puedes revocar la sesión actual. Usa el endpoint de logout.',
            ], 400);
        }

        $this->logActivity('session_revoked', null, [
            'token_id' => $tokenId,
            'token_name' => $token->name,
        ], $user);

        $token->delete();

        return response()->json([
            'message' => 'Sesión revocada exitosamente',
        ], 200);
    }
}
