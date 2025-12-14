<?php

namespace App\Http\Controllers\Users;

use App\Http\Controllers\Controller;
use App\Http\Requests\Users\UserStoreRequest;
use App\Http\Requests\Users\UserUpdateRequest;
use App\Http\Requests\Users\EstudianteStoreRequest;
use App\Http\Requests\Users\EstudianteUpdateRequest;
use App\Http\Requests\Users\DocenteStoreRequest;
use App\Http\Requests\Users\DocenteUpdateRequest;
use App\Http\Requests\Users\PadreStoreRequest;
use App\Http\Requests\Users\PadreUpdateRequest;
use App\Http\Resources\UserResource;
use App\Http\Resources\EstudianteResource;
use App\Http\Resources\DocenteResource;
use App\Http\Resources\PadreResource;
use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    public function __construct(
        private UserService $userService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');
        $users = $this->userService->getAllUsers($search);

        return response()->json($users);
    }

    public function storeUser(UserStoreRequest $request): JsonResponse
    {
        $user = $this->userService->createAdmin($request->validated());

        return response()->json([
            'message' => 'Administrador creado exitosamente',
            'user' => new UserResource($user),
        ], 201);
    }

    public function storeStudent(EstudianteStoreRequest $request): JsonResponse
    {
        $student = $this->userService->createStudent($request->validated());

        return response()->json([
            'message' => 'Estudiante creado exitosamente',
            'user' => new EstudianteResource($student),
        ], 201);
    }

    public function storeTeacher(DocenteStoreRequest $request): JsonResponse
    {
        $teacher = $this->userService->createTeacher($request->validated());

        return response()->json([
            'message' => 'Docente creado exitosamente',
            'user' => new DocenteResource($teacher),
        ], 201);
    }

    public function storeParent(PadreStoreRequest $request): JsonResponse
    {
        $parent = $this->userService->createParent($request->validated());

        return response()->json([
            'message' => 'Apoderado creado exitosamente',
            'user' => new PadreResource($parent),
        ], 201);
    }

    public function show(int $id, Request $request): JsonResponse
    {
        $type = $request->query('type', 'student');
        $user = $this->userService->findUserByType($type, $id);

        $resource = match ($type) {
            'admin'   => new UserResource($user),
            'student' => new EstudianteResource($user),
            'teacher' => new DocenteResource($user),
            'parent'  => new PadreResource($user),
            default   => throw new \InvalidArgumentException("Tipo de usuario inválido: {$type}")
        };

        return response()->json($resource);
    }

    public function updateUser(UserUpdateRequest $request, int $id): JsonResponse
    {
        $user = $this->userService->updateUser('admin', $id, $request->validated());

        return response()->json([
            'message' => 'Administrador actualizado exitosamente',
            'user' => new UserResource($user),
        ]);
    }

    public function updateStudent(EstudianteUpdateRequest $request, int $id): JsonResponse
    {
        $student = $this->userService->updateUser('student', $id, $request->validated());

        return response()->json([
            'message' => 'Estudiante actualizado exitosamente',
            'user' => new EstudianteResource($student),
        ]);
    }

    public function updateTeacher(DocenteUpdateRequest $request, int $id): JsonResponse
    {
        $teacher = $this->userService->updateUser('teacher', $id, $request->validated());

        return response()->json([
            'message' => 'Docente actualizado exitosamente',
            'user' => new DocenteResource($teacher),
        ]);
    }

    public function updateParent(PadreUpdateRequest $request, int $id): JsonResponse
    {
        $parent = $this->userService->updateUser('parent', $id, $request->validated());

        return response()->json([
            'message' => 'Apoderado actualizado exitosamente',
            'user' => new PadreResource($parent),
        ]);
    }

    public function destroy(int $id, Request $request): JsonResponse
    {
        $type = $request->query('type', 'student');
        $this->userService->deleteUser($type, $id);

        return response()->json([
            'message' => 'Usuario eliminado exitosamente',
        ]);
    }
}