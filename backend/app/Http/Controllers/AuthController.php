<?php

namespace App\Http\Controllers;


use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\LoginAttempt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['bail', 'required', 'string', 'email', 'max:255'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        $key = 'login-attempts:' . sha1($request->ip() . '|' . $request->email);

        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);

            return response()->json([
                'message' => 'Demasiados intentos de inicio de sesión. Intenta nuevamente en ' . $seconds . ' segundos.',
                'retry_after' => $seconds,
            ], 429);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            RateLimiter::hit($key, 60);

            $this->logFailedAttempt($request);

            throw ValidationException::withMessages([
                'email' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }

        if (!$user->isActivo()) {
            return response()->json([
                'message' => 'Tu cuenta se encuentra inactiva. Contacta al administrador.',
                'error_code' => 'ACCOUNT_INACTIVE',
            ], 403);
        }

        $user->tokens()->delete();

        $token = $user->createToken(
            'auth-token',
            ['server:access'],
            Carbon::now()->addHours(8)
        )->plainTextToken;

        $this->logSuccessfulLogin($user, $request);

        RateLimiter::clear($key);

        return response()->json([
            'message' => 'Inicio de sesión exitoso.',
            'user' => [
                'id' => $user->id,
                'full_name' => $user->fullName,
                'email' => $user->email,
                'rol' => $user->rol,
                'is_director' => $user->isDirector(),
                'avatar_url' => $user->avatar_url,
            ],
            'token' => $token,
            'token_type' => 'Bearer',
            'expires_at' => Carbon::now()->addHours(8)->toIso8601String(),
        ], 200);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->user()->currentAccessToken()->delete();

        \Log::info('Usuario cerró sesión', [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Sesión cerrada exitosamente.',
        ], 200);
    }

    public function logoutAll(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $user->tokens()->delete();

        \Log::info('Usuario cerró todas las sesiones', [
            'user_id' => $user->id,
            'email' => $user->email,
        ]);

        return response()->json([
            'message' => 'Todas las sesiones han sido cerradas.',
        ], 200);
    }

    public function validateToken(Request $request): JsonResponse
    {
        return response()->json([
            'valid' => true,
            'user' => [
                'id' => $request->user()->id,
                'full_name' => $request->user()->fullName,
                'email' => $request->user()->email,
                'rol' => $request->user()->rol,
            ],
        ], 200);
    }

    private function logFailedAttempt(Request $request): void
    {
        \Log::warning('Intento de login fallido', [
            'email' => $request->email,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now(),
        ]);
    }

    private function logSuccessfulLogin(User $user, Request $request): void
    {
        \Log::info('Login exitoso', [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now(),
        ]);
    }
}
