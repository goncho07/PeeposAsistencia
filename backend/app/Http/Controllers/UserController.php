<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        return response()->json(User::orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|string', // 'student', 'teacher', 'admin', 'parent'
            'dni' => 'required|string|unique:users',
            // Campos opcionales para estudiantes
            'grade' => 'nullable|string',
            'section' => 'nullable|string',
            'level' => 'nullable|string',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'role' => $validated['role'], // Asegúrate de tener columna 'role' en tu migración users o usar spatie/laravel-permission
            // Mapea otros campos si tu tabla users los tiene o si usas una tabla relacionada profiles
        ]);
        
        // Nota: En una implementación real, guardaría DNI, grado, etc. en la tabla users o una tabla relacionada.
        // Asumiremos por ahora que User tiene campos extra o usaremos un json column si es rápido.
        // Para este MVP, ajustaré la migración de users para tener estos campos.

        return response()->json($user, 201);
    }
}
