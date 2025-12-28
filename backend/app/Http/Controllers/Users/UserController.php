<?php

namespace App\Http\Controllers\Users;

use App\Http\Controllers\Controller;
use App\Http\Requests\Users\UserStoreRequest;
use App\Http\Requests\Users\UserUpdateRequest;
use App\Http\Resources\UserResource;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct(
        private UserService $adminUserService
    ) {}

    /**
     * Display a listing of admin users
     *
     * GET /api/admin-users
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $search = $request->query('search');
            $role = $request->query('role');
            $status = $request->query('status');

            $users = $this->adminUserService->getAllAdminUsers($search, $role, $status);

            return $this->success(
                UserResource::collection($users),
                'Usuarios administrativos obtenidos exitosamente'
            );
        } catch (\Exception $e) {
            return $this->error('Error al obtener usuarios: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Display the specified admin user
     *
     * GET /api/admin-users/{id}
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        try {
            $user = $this->adminUserService->findById($id);

            return $this->success(
                new UserResource($user),
                'Usuario obtenido exitosamente'
            );
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->error('Usuario no encontrado', null, 404);
        } catch (\Exception $e) {
            return $this->error('Error al obtener usuario: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Store a newly created admin user
     *
     * POST /api/admin-users
     *
     * @param AdminUserStoreRequest $request
     * @return JsonResponse
     */
    public function store(UserStoreRequest $request): JsonResponse
    {
        try {
            $user = $this->adminUserService->create($request->validated());

            return $this->created(
                new UserResource($user),
                'Usuario creado exitosamente'
            );
        } catch (\Exception $e) {
            return $this->error('Error al crear usuario: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Update the specified admin user
     *
     * PUT/PATCH /api/admin-users/{id}
     *
     * @param UserUpdateRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(UserUpdateRequest $request, int $id): JsonResponse
    {
        try {
            $user = $this->adminUserService->update($id, $request->validated());

            return $this->success(
                new UserResource($user),
                'Usuario actualizado exitosamente'
            );
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->error('Usuario no encontrado', null, 404);
        } catch (\Exception $e) {
            return $this->error('Error al actualizar usuario: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Remove the specified admin user
     *
     * DELETE /api/admin-users/{id}
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->adminUserService->delete($id);

            return $this->success(null, 'Usuario eliminado exitosamente');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->error('Usuario no encontrado', null, 404);
        } catch (\Exception $e) {
            return $this->error('Error al eliminar usuario: ' . $e->getMessage(), null, 500);
        }
    }
}