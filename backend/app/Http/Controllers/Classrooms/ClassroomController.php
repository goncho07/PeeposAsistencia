<?php

namespace App\Http\Controllers\Classrooms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Classrooms\ClassroomStoreRequest;
use App\Http\Requests\Classrooms\ClassroomUpdateRequest;
use App\Http\Resources\ClassroomResource;
use App\Services\ClassroomService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClassroomController extends Controller
{
    public function __construct(
        private ClassroomService $classroomService
    ) {}

    /**
     * Display a listing of classrooms
     *
     * GET /api/classrooms
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $search = $request->query('search');
            $level = $request->query('level');
            $shift = $request->query('shift');
            $status = $request->query('status');

            $classrooms = $this->classroomService->getAllClassrooms($search, $level, $shift, $status);

            return $this->success(
                ClassroomResource::collection($classrooms),
                'Aulas obtenidas exitosamente'
            );
        } catch (\Exception $e) {
            return $this->error('Error al obtener aulas: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Display the specified classroom
     *
     * GET /api/classrooms/{id}
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        try {
            $classroom = $this->classroomService->findById($id);

            return $this->success(
                new ClassroomResource($classroom),
                'Aula obtenida exitosamente'
            );
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->error('Aula no encontrada', null, 404);
        } catch (\Exception $e) {
            return $this->error('Error al obtener aula: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Store a newly created classroom
     *
     * POST /api/classrooms
     *
     * @param ClassroomStoreRequest $request
     * @return JsonResponse
     */
    public function store(ClassroomStoreRequest $request): JsonResponse
    {
        try {
            $classroom = $this->classroomService->create($request->validated());

            return $this->created(
                new ClassroomResource($classroom),
                'Aula creada exitosamente'
            );
        } catch (\Exception $e) {
            return $this->error('Error al crear aula: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Update the specified classroom
     *
     * PUT/PATCH /api/classrooms/{id}
     *
     * @param ClassroomUpdateRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(ClassroomUpdateRequest $request, int $id): JsonResponse
    {
        try {
            $classroom = $this->classroomService->update($id, $request->validated());

            return $this->success(
                new ClassroomResource($classroom),
                'Aula actualizada exitosamente'
            );
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->error('Aula no encontrada', null, 404);
        } catch (\Exception $e) {
            return $this->error('Error al actualizar aula: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Remove the specified classroom
     *
     * DELETE /api/classrooms/{id}
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->classroomService->delete($id);

            return $this->success(null, 'Aula eliminada exitosamente');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->error('Aula no encontrada', null, 404);
        } catch (\Exception $e) {
            return $this->error('Error al eliminar aula: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get classrooms by level
     *
     * GET /api/classrooms/by-level/{level}
     *
     * @param string $level
     * @return JsonResponse
     */
    public function byLevel(string $level): JsonResponse
    {
        try {
            if (!in_array($level, ['INICIAL', 'PRIMARIA', 'SECUNDARIA'])) {
                return $this->error('Nivel inválido', null, 400);
            }

            $classrooms = $this->classroomService->getByLevel($level);

            return $this->success(
                ClassroomResource::collection($classrooms),
                'Aulas obtenidas exitosamente'
            );
        } catch (\Exception $e) {
            return $this->error('Error al obtener aulas: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get classrooms by teacher
     *
     * GET /api/classrooms/by-teacher/{teacherId}
     *
     * @param int $teacherId
     * @return JsonResponse
     */
    public function byTeacher(int $teacherId): JsonResponse
    {
        try {
            $classrooms = $this->classroomService->getByTeacher($teacherId);

            return $this->success(
                ClassroomResource::collection($classrooms),
                'Aulas obtenidas exitosamente'
            );
        } catch (\Exception $e) {
            return $this->error('Error al obtener aulas: ' . $e->getMessage(), null, 500);
        }
    }
}
