<?php

namespace App\Http\Controllers;

use App\Exceptions\BusinessException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Users\UserStoreRequest;
use App\Http\Requests\Users\UserUpdateRequest;
use App\Http\Resources\UserResource;
use App\Services\UserService;
use App\Traits\HasExpandableRelations;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    use HasExpandableRelations;

    public function __construct(
        private UserService $adminUserService
    ) {}

    /**
     * Display a listing of admin users
     *
     * GET /api/admin-users
     * GET /api/admin-users?search=pepito
     * GET /api/admin-users?role=director
     * GET /api/admin-users?status=activo
     * GET /api/admin-users?expand=teacher
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
            $expand = $this->parseExpand($request);

            $users = $this->adminUserService->getAllAdminUsers($search, $role, $status, $expand);

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
     * GET /api/admin-users/{id}?expand=teacher
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $expand = $this->parseExpand($request);
            $user = $this->adminUserService->findById($id, $expand);

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
        } catch (BusinessException $e) {
            return $this->error($e->getMessage(), null, 422);
        } catch (\Exception $e) {
            return $this->error('Error al eliminar usuario: ' . $e->getMessage(), null, 500);
        }
    }
}