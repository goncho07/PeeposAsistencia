<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\Request;
use App\Models\User;
use Carbon\Carbon;

class AuthenticatedSessionController extends Controller
{
    public function store(LoginRequest $request): JsonResponse
    {
        $request->ensureIsNotRateLimited();

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            $request->hitRateLimit();

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

        $request->clearRateLimit();

        return response()->json([
            'message' => 'Inicio de sesión exitoso.',
            'user' => [
                'id' => $user->id,
                'name' => $user->full_name,
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

    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'valid' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->full_name,
                'email' => $user->email,
                'rol' => $user->rol,
                'is_director' => $user->isDirector(),
                'avatar_url' => $user->avatar_url,
            ],
            'message' => 'Token válido.'
        ]);
    }

    public function destroy(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user) {
            $user->currentAccessToken()?->delete();
        }

        return response()->json([
            'message' => 'Sesión cerrada correctamente.',
        ], 200);
    }

    public function destroyAll(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user) {
            $user->tokens()->delete();
        }

        return response()->json([
            'message' => 'Todas las sesiones fueron cerradas correctamente.',
        ], 200);
    }
}
