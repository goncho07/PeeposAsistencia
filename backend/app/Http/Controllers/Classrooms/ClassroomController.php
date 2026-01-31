<?php

namespace App\Http\Controllers\Classrooms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Classrooms\ClassroomStoreRequest;
use App\Http\Requests\Classrooms\ClassroomUpdateRequest;
use App\Http\Resources\ClassroomResource;
use App\Services\ClassroomService;
use App\Traits\ParsesExpandParameter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClassroomController extends Controller
{
    use ParsesExpandParameter;

    public function __construct(
        private ClassroomService $classroomService
    ) {}

    /**
     * Display a listing of classrooms
     *
     * GET /api/classrooms
     * GET /api/classrooms?search=A
     * GET /api/classrooms?level=PRIMARIA
     * GET /api/classrooms?shift=MAÑANA
     * GET /api/classrooms?tutor_id=5
     * GET /api/classrooms?teacher_id=3
     * GET /api/classrooms?expand=tutor,students
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
            $tutorId = $request->query('tutor_id');
            $teacherId = $request->query('teacher_id');
            $expand = $this->parseExpand($request);

            $classrooms = $this->classroomService->getAllClassrooms(
                $search,
                $level,
                $shift,
                $status,
                $tutorId,
                $teacherId,
                $expand
            );

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
     * GET /api/classrooms/{id}?expand=tutor,teachers,students
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $expand = $this->parseExpand($request);
            $classroom = $this->classroomService->findById($id, $expand);

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
}
