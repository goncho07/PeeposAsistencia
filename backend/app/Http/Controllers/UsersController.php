<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Estudiante;
use App\Models\Docente;
use App\Models\Padre;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UsersController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->query('type');
        $search = $request->query('search');

        $allUsers = collect();

        if (!$type || $type === 'admin') {
            $admins = User::query()
                ->when($search, function ($query, $search) {
                    $query->where(function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('paternal_surname', 'like', "%{$search}%")
                            ->orWhere('maternal_surname', 'like', "%{$search}%")
                            ->orWhere('dni', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
                })
                ->orderBy('name')
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->full_name,
                        'email' => $user->email,
                        'role' => 'admin',
                        'dni' => $user->dni ?? '-',
                        'level' => null,
                        'grade' => null,
                        'section' => null,
                        'status' => $user->status,
                        'phone' => $user->phone_number,
                        'area' => $user->rol,
                        'avatar_url' => $user->avatar_url,
                        'aula_info' => null,
                    ];
                });
            $allUsers = $allUsers->merge($admins);
        }

        if (!$type || $type === 'student') {
            $estudiantes = Estudiante::with('aula.docente')
                ->when($search, function ($query, $search) {
                    $query->where(function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('paternal_surname', 'like', "%{$search}%")
                            ->orWhere('maternal_surname', 'like', "%{$search}%")
                            ->orWhere('document_number', 'like', "%{$search}%")
                            ->orWhere('student_code', 'like', "%{$search}%");
                    });
                })
                ->orderBy('name')
                ->get()
                ->map(function ($estudiante) {
                    $aula = $estudiante->aula;

                    return [
                        'id' => $estudiante->id,
                        'name' => $estudiante->full_name,
                        'email' => null,
                        'role' => 'student',
                        'dni' => $estudiante->document_number,
                        'level' => $aula?->nivel,
                        'grade' => $aula?->grado,
                        'section' => $aula?->seccion,
                        'status' => 'active',
                        'phone' => null,
                        'area' => null,
                        'avatar_url' => null,
                        'aula_info' => $aula ? [
                            'id' => $aula->id,
                            'codigo' => $aula->codigo,
                            'nombre_completo' => $aula->nombre_completo,
                            'docente_tutor' => $aula->docente ? $aula->docente->full_name : 'Sin asignar',
                        ] : null,
                        'student_code' => $estudiante->student_code,
                        'edad' => $estudiante->edad,
                    ];
                });
            $allUsers = $allUsers->merge($estudiantes);
        }

        if (!$type || $type === 'teacher') {
            $docentes = Docente::with('aulas')
                ->when($search, function ($query, $search) {
                    $query->where(function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('paternal_surname', 'like', "%{$search}%")
                            ->orWhere('maternal_surname', 'like', "%{$search}%")
                            ->orWhere('dni', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
                })
                ->orderBy('name')
                ->get()
                ->map(function ($docente) {
                    return [
                        'id' => $docente->id,
                        'name' => $docente->full_name,
                        'email' => $docente->email,
                        'role' => 'teacher',
                        'dni' => $docente->dni,
                        'level' => null,
                        'grade' => null,
                        'section' => null,
                        'status' => 'active',
                        'phone' => $docente->phone_number,
                        'area' => $docente->area,
                        'avatar_url' => null,
                        'aula_info' => null,
                        'aulas_tutorizadas' => $docente->aulas->map(fn($aula) => [
                            'id' => $aula->id,
                            'codigo' => $aula->codigo,
                            'nombre_completo' => $aula->nombre_completo,
                        ]),
                    ];
                });
            $allUsers = $allUsers->merge($docentes);
        }

        if (!$type || $type === 'parent') {
            $padres = Padre::with('estudiantes.aula')
                ->when($search, function ($query, $search) {
                    $query->where(function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('paternal_surname', 'like', "%{$search}%")
                            ->orWhere('maternal_surname', 'like', "%{$search}%")
                            ->orWhere('document_number', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
                })
                ->orderBy('name')
                ->get()
                ->map(function ($padre) {
                    return [
                        'id' => $padre->id,
                        'name' => $padre->full_name,
                        'email' => $padre->email,
                        'role' => 'parent',
                        'dni' => $padre->document_number,
                        'level' => null,
                        'grade' => null,
                        'section' => null,
                        'status' => 'active',
                        'phone' => $padre->phone_number,
                        'area' => $padre->relationship_type,
                        'avatar_url' => null,
                        'aula_info' => null,
                        'hijos' => $padre->estudiantes->map(fn($hijo) => [
                            'id' => $hijo->id,
                            'nombre' => $hijo->full_name,
                            'aula' => $hijo->aula ? $hijo->aula->nombre_completo : 'Sin aula',
                        ]),
                    ];
                });
            $allUsers = $allUsers->merge($padres);
        }

        return response()->json($allUsers->values());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'role' => ['required', Rule::in(['admin', 'student', 'teacher', 'parent'])],
            'name' => 'required|string|max:100',
            'paternal_surname' => 'required|string|max:50',
            'maternal_surname' => 'required|string|max:50',
            'email' => 'nullable|email|max:255',
            'phone_number' => 'nullable|string|max:15',

            // Admin específico
            'password' => 'required_if:role,admin|nullable|string|min:8',
            'admin_role' => 'required_if:role,admin|nullable|in:DIRECTOR,SUBDIRECTOR,SECRETARIO,ESCANER',
            'dni' => 'required_if:role,admin,teacher|nullable|string|max:8',

            // Estudiante específico
            'document_type' => 'required_if:role,student,parent|nullable|in:DNI,CE,PAS,CI,PTP',
            'document_number' => 'required_if:role,student,parent|nullable|string|max:20',
            'gender' => 'required_if:role,student|nullable|in:M,F',
            'date_of_birth' => 'required_if:role,student|nullable|date',
            'aula_id' => 'required_if:role,student|nullable|exists:aulas,id',
            'padre_id' => 'nullable|exists:padres,id',

            // Docente específico
            'area' => 'required_if:role,teacher|nullable|string|max:30',

            // Padre específico
            'relationship_type' => 'required_if:role,parent|nullable|in:PADRE,MADRE,APODERADO,TUTOR',
        ]);

        DB::beginTransaction();

        try {
            $user = null;

            switch ($validated['role']) {
                case 'admin':
                    if (User::where('email', $validated['email'])->exists()) {
                        return response()->json([
                            'message' => 'El email ya está registrado',
                        ], 422);
                    }

                    $user = User::create([
                        'name' => $validated['name'],
                        'paternal_surname' => $validated['paternal_surname'],
                        'maternal_surname' => $validated['maternal_surname'],
                        'email' => $validated['email'],
                        'password' => Hash::make($validated['password']),
                        'rol' => $validated['admin_role'],
                        'dni' => $validated['dni'],
                        'phone_number' => $validated['phone_number'] ?? null,
                        'status' => 'ACTIVO',
                    ]);
                    break;

                case 'student':
                    if (Estudiante::where('document_number', $validated['document_number'])->exists()) {
                        return response()->json([
                            'message' => 'El número de documento ya está registrado',
                        ], 422);
                    }

                    $user = Estudiante::create([
                        'qr_code' => $this->generateQRCode(),
                        'student_code' => $this->generateStudentCode(),
                        'name' => $validated['name'],
                        'paternal_surname' => $validated['paternal_surname'],
                        'maternal_surname' => $validated['maternal_surname'],
                        'document_type' => $validated['document_type'],
                        'document_number' => $validated['document_number'],
                        'gender' => $validated['gender'],
                        'date_of_birth' => $validated['date_of_birth'],
                        'aula_id' => $validated['aula_id'],
                        'padre_id' => $validated['padre_id'] ?? null,
                    ]);

                    $user->load('aula');
                    break;

                case 'teacher':
                    if (Docente::where('dni', $validated['dni'])->exists()) {
                        return response()->json([
                            'message' => 'El DNI ya está registrado',
                        ], 422);
                    }

                    if ($validated['email'] && Docente::where('email', $validated['email'])->exists()) {
                        return response()->json([
                            'message' => 'El email ya está registrado',
                        ], 422);
                    }

                    $user = Docente::create([
                        'dni' => $validated['dni'],
                        'name' => $validated['name'],
                        'area' => $validated['area'],
                        'paternal_surname' => $validated['paternal_surname'],
                        'maternal_surname' => $validated['maternal_surname'],
                        'email' => $validated['email'],
                        'phone_number' => $validated['phone_number'] ?? null,
                    ]);
                    break;

                case 'parent':
                    if (Padre::where('document_number', $validated['document_number'])->exists()) {
                        return response()->json([
                            'message' => 'El número de documento ya está registrado',
                        ], 422);
                    }

                    $user = Padre::create([
                        'document_type' => $validated['document_type'],
                        'document_number' => $validated['document_number'],
                        'name' => $validated['name'],
                        'paternal_surname' => $validated['paternal_surname'],
                        'maternal_surname' => $validated['maternal_surname'],
                        'phone_number' => $validated['phone_number'] ?? null,
                        'email' => $validated['email'],
                        'relationship_type' => $validated['relationship_type'],
                    ]);
                    break;
            }

            DB::commit();

            return response()->json([
                'message' => 'Usuario creado exitosamente',
                'user' => $user,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al crear usuario',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function show($id, Request $request)
    {
        $type = $request->query('type', 'student');

        $user = match ($type) {
            'admin' => User::find($id),
            'student' => Estudiante::with('aula.docente', 'padre')->find($id),
            'teacher' => Docente::with('aulas')->find($id),
            'parent' => Padre::with('estudiantes.aula')->find($id),
            default => null,
        };

        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        return response()->json($user);
    }

    public function update(Request $request, $id)
    {
        $type = $request->input('role') ?? $request->query('type');

        if (!$type) {
            return response()->json(['message' => 'Tipo de usuario no especificado'], 422);
        }

        DB::beginTransaction();

        try {
            $user = match ($type) {
                'admin' => User::findOrFail($id),
                'student' => Estudiante::findOrFail($id),
                'teacher' => Docente::findOrFail($id),
                'parent' => Padre::findOrFail($id),
            };

            $validated = $this->getValidationRules($type, $request, $id);

            if ($type === 'student' && isset($validated['aula_id'])) {
                $nuevaAula = \App\Models\Aula::find($validated['aula_id']);
                if ($nuevaAula && $nuevaAula->esta_completa) {
                    return response()->json([
                        'message' => 'El aula seleccionada está completa',
                    ], 422);
                }
            }

            $user->update($validated);
            DB::commit();

            return response()->json([
                'message' => 'Usuario actualizado exitosamente',
                'user' => $user->fresh(),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar usuario',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id, Request $request)
    {
        $type = $request->query('type', 'student');

        DB::beginTransaction();

        try {
            $user = match ($type) {
                'admin' => User::findOrFail($id),
                'student' => Estudiante::findOrFail($id),
                'teacher' => Docente::findOrFail($id),
                'parent' => Padre::findOrFail($id),
            };

            if ($type === 'teacher') {
                if ($user->aulas()->exists()) {
                    return response()->json([
                        'message' => 'No se puede eliminar el docente porque tiene aulas asignadas',
                    ], 422);
                }
            }

            if ($type === 'parent') {
                if ($user->estudiantes()->exists()) {
                    return response()->json([
                        'message' => 'No se puede eliminar el apoderado porque tiene estudiantes asociados',
                    ], 422);
                }
            }

            $user->delete();
            DB::commit();

            return response()->json([
                'message' => 'Usuario eliminado exitosamente',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al eliminar usuario',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    private function generateQRCode(): string
    {
        return 'QR-' . strtoupper(uniqid());
    }

    private function generateStudentCode(): string
    {
        $year = date('Y');
        $lastStudent = Estudiante::latest('id')->first();
        $sequential = $lastStudent ? ($lastStudent->id + 1) : 1;

        return sprintf('%s-%04d', $year, $sequential);
    }

    private function getValidationRules(string $type, Request $request, $id): array
    {
        return $request->all();
    }
}
