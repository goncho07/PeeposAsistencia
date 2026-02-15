<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\MobileLoginRequest;
use App\Models\User;
use App\Traits\LogsActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class MobileAuthSessionController extends Controller
{
    use LogsActivity;

    /**
     * Mobile login - returns bearer token.
     *
     * POST /api/mobile/auth/login
     */
    public function login(MobileLoginRequest $request): JsonResponse
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

        if ($user->isInactive()) {
            return $this->error('Tu cuenta está inactiva. Contacta al administrador.', null, 403);
        }

        if ($user->role === 'SUPERADMIN') {
            if ($request->filled('tenant_slug')) {
                $tenant = \App\Models\Tenant::where('slug', $request->tenant_slug)->first();

                if (!$tenant) {
                    return $this->error('Institución no encontrada.', null, 404);
                }

                app()->instance('current_tenant', $tenant);
                app()->instance('current_tenant_id', $tenant->id);

                $user->update(['tenant_id' => $tenant->id]);
            } else {
                return $this->error('Debes seleccionar una institución para continuar.', null, 400);
            }
        } else {
            if (!$user->tenant) {
                return $this->error('No tienes una institución asignada.', null, 403);
            }

            if (!$user->tenant->is_active) {
                return $this->error(
                    'Tu institución está inactiva. Contacta al soporte.',
                    ['error' => 'TENANT_INACTIVE'],
                    403
                );
            }

            if ($request->filled('tenant_slug')) {
                $tenant = \App\Models\Tenant::where('slug', $request->tenant_slug)->first();

                if (!$tenant) {
                    return $this->error('Institución no encontrada.', null, 404);
                }

                if ($user->tenant_id !== $tenant->id) {
                    return $this->error('No tienes acceso a esta institución.', null, 403);
                }
            }
        }

        $ip = client_ip();
        $user->updateLastLogin($ip);

        $this->logActivity('user_login', null, [
            'ip_address' => $ip,
            'user_agent' => $request->userAgent(),
            'auth_mode' => 'token',
        ], $user);

        $deviceName = $request->input('device_name');
        $expiresAt = $request->boolean('remember_me', false)
            ? now()->addDays(90)
            : now()->addDays(30);
        $token = $user->createToken($deviceName, ['*'], $expiresAt);

        $token->accessToken->update([
            'ip_address' => $ip,
        ]);

        return $this->success([
            'access_token' => $token->plainTextToken,
            'token_type' => 'Bearer',
            'expires_at' => $token->accessToken->expires_at,
            'user' => $this->formatUserData($user),
        ], 'Inicio de sesión exitoso');
    }

    /**
     * Mobile logout - delete current token.
     *
     * POST /api/mobile/auth/logout
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        $this->logActivity('user_logout', null, [
            'ip_address' => client_ip(),
        ], $user);

        $user->currentAccessToken()->delete();

        return $this->success(null, 'Sesión cerrada exitosamente');
    }

    /**
     * Logout from all devices - delete all tokens.
     *
     * POST /api/mobile/auth/logout-all
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

        return $this->success(null, 'Sesión cerrada en todos los dispositivos');
    }

    /**
     * Refresh token - delete old, create new.
     *
     * POST /api/mobile/auth/refresh
     */
    public function refresh(Request $request): JsonResponse
    {
        $user = $request->user();
        $currentToken = $user->currentAccessToken();

        $deviceName = $currentToken->name ?? 'mobile-app';
        $ipAddress = $currentToken->ip_address ?? client_ip();

        $currentToken->delete();

        $token = $user->createToken($deviceName, ['*'], now()->addDays(30));

        $token->accessToken->update([
            'ip_address' => $ipAddress,
        ]);

        $this->logActivity('token_refreshed', null, [
            'ip_address' => $request->ip(),
        ], $user);

        return $this->success([
            'access_token' => $token->plainTextToken,
            'token_type' => 'Bearer',
            'expires_at' => $token->accessToken->expires_at,
        ], 'Token renovado exitosamente');
    }

    /**
     * Get all active token sessions.
     *
     * GET /api/mobile/auth/sessions
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

        return $this->success(['sessions' => $tokens]);
    }

    /**
     * Revoke a specific token session.
     *
     * DELETE /api/mobile/auth/sessions/{tokenId}
     */
    public function revokeSession(Request $request, int $tokenId): JsonResponse
    {
        $user = $request->user();
        $token = $user->tokens()->find($tokenId);

        if (!$token) {
            return $this->error('Token no encontrado', null, 404);
        }

        if ($token->id === $request->user()->currentAccessToken()->id) {
            return $this->error('No puedes revocar la sesión actual. Usa el endpoint de logout.', null, 400);
        }

        $this->logActivity('session_revoked', null, [
            'token_id' => $tokenId,
            'token_name' => $token->name,
        ], $user);

        $token->delete();

        return $this->success(null, 'Sesión revocada exitosamente');
    }

    /**
     * Change the authenticated user's password.
     *
     * POST /api/mobile/auth/change-password
     */
    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:8', 'confirmed'],
        ], [
            'current_password.required' => 'La contraseña actual es obligatoria.',
            'new_password.required' => 'La nueva contraseña es obligatoria.',
            'new_password.min' => 'La nueva contraseña debe tener al menos :min caracteres.',
            'new_password.confirmed' => 'La confirmación de la nueva contraseña no coincide.',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['La contraseña actual es incorrecta.'],
            ]);
        }

        if ($request->current_password === $request->new_password) {
            throw ValidationException::withMessages([
                'new_password' => ['La nueva contraseña debe ser diferente a la actual.'],
            ]);
        }

        $user->update(['password' => $request->new_password]);

        $currentTokenId = $user->currentAccessToken()->id;
        $user->tokens()->where('id', '!=', $currentTokenId)->delete();

        $this->logActivity('password_changed', null, [
            'ip_address' => client_ip(),
        ], $user);

        return $this->success(null, 'Contraseña actualizada exitosamente');
    }

    /**
     * Update the authenticated user's profile.
     *
     * PUT /api/mobile/auth/profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'paternal_surname' => ['sometimes', 'required', 'string', 'max:100'],
            'maternal_surname' => ['sometimes', 'nullable', 'string', 'max:100'],
            'phone_number' => ['sometimes', 'nullable', 'string', 'max:20'],
        ], [
            'name.required' => 'El nombre es obligatorio.',
            'paternal_surname.required' => 'El apellido paterno es obligatorio.',
        ]);

        $user = $request->user();
        $user->update($validated);

        $this->logActivity('profile_updated', null, [
            'ip_address' => client_ip(),
        ], $user);

        return $this->success([
            'user' => [
                'id' => $user->id,
                'name' => $user->full_name,
                'first_name' => $user->name,
                'paternal_surname' => $user->paternal_surname,
                'maternal_surname' => $user->maternal_surname,
                'email' => $user->email,
                'document_type' => $user->document_type,
                'document_number' => $user->document_number,
                'role' => $user->role,
                'status' => $user->status,
                'phone_number' => $user->phone_number,
                'photo_url' => get_storage_url($user->photo_url),
                'last_login_at' => $user->last_login_at,
                'tenant_id' => $user->tenant_id,
                'tenant' => $user->tenant ? [
                    'id' => $user->tenant->id,
                    'name' => $user->tenant->name,
                    'modular_code' => $user->tenant->modular_code,
                    'slug' => $user->tenant->slug,
                    'logo_url' => get_storage_url($user->tenant->logo_url),
                    'banner_url' => get_storage_url($user->tenant->banner_url),
                    'background_url' => get_storage_url($user->tenant->background_url),
                    'timezone' => $user->tenant->timezone,
                ] : null,
            ],
        ], 'Perfil actualizado exitosamente');
    }

    /**
     * Format user data for response.
     */
    private function formatUserData(User $user): array
    {
        $userData = [
            'id' => $user->id,
            'name' => $user->full_name,
            'email' => $user->email,
            'role' => $user->role,
            'tenant_id' => $user->tenant_id,
            'tenant' => $user->tenant ? [
                'id' => $user->tenant->id,
                'name' => $user->tenant->name,
                'modular_code' => $user->tenant->modular_code,
                'ugel' => $user->tenant->ugel,
                'slug' => $user->tenant->slug,
                'logo_url' => get_storage_url($user->tenant->logo_url),
                'banner_url' => get_storage_url($user->tenant->banner_url),
                'background_url' => get_storage_url($user->tenant->background_url),
            ] : null,
        ];

        if ($user->role === 'SUPERADMIN' && $user->tenant_id) {
            $userData['viewing_tenant'] = true;
        }

        return $userData;
    }
}
