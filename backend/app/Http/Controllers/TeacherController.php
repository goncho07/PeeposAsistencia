<?php

namespace App\Http\Controllers;

use App\Exceptions\BusinessException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Teachers\TeacherStoreRequest;
use App\Http\Requests\Teachers\TeacherUpdateRequest;
use App\Http\Resources\TeacherResource;
use App\Services\TeacherService;
use App\Traits\HasExpandableRelations;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TeacherController extends Controller
{
    use HasExpandableRelations;

    public function __construct(
        private TeacherService $teacherService
    ) {}

    /**
     * Display a listing of teachers
     *
     * GET /api/teachers
     * GET /api/teachers?search=idk
     * GET /api/teachers?level=inicial
     * GET /api/teachers?expand=user
     * GET /api/teachers?expand=classrooms,tutoredClassrooms
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $search = $request->query('search');
            $level = $request->query('level');
            $expand = $this->parseExpand($request);

            $teachers = $this->teacherService->getAllTeachers($search, $level, $expand);

            return $this->success(
                TeacherResource::collection($teachers),
                'Docentes obtenidos exitosamente'
            );
        } catch (\Exception $e) {
            return $this->error('Error al obtener docentes: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Display the specified teacher
     *
     * GET /api/teachers/{id}
     * GET /api/teachers/{id}?expand=user,classrooms,tutoredClassrooms
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $expand = $this->parseExpand($request);
            $teacher = $this->teacherService->findById($id, $expand);

            return $this->success(
                new TeacherResource($teacher),
                'Docente obtenido exitosamente'
            );
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->error('Docente no encontrado', null, 404);
        } catch (\Exception $e) {
            return $this->error('Error al obtener docente: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Store a newly created teacher
     *
     * POST /api/teachers
     *
     * @param TeacherStoreRequest $request
     * @return JsonResponse
     */
    public function store(TeacherStoreRequest $request): JsonResponse
    {
        try {
            $teacher = $this->teacherService->create($request->validated());

            return $this->created(
                new TeacherResource($teacher),
                'Docente y cuenta de usuario creados exitosamente'
            );
        } catch (\Exception $e) {
            return $this->error('Error al crear docente: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Update the specified teacher
     *
     * PUT/PATCH /api/teachers/{id}
     *
     * @param TeacherUpdateRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(TeacherUpdateRequest $request, int $id): JsonResponse
    {
        try {
            $teacher = $this->teacherService->update($id, $request->validated());

            return $this->success(
                new TeacherResource($teacher),
                'Docente actualizado exitosamente'
            );
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->error('Docente no encontrado', null, 404);
        } catch (\Exception $e) {
            return $this->error('Error al actualizar docente: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Remove the specified teacher
     *
     * DELETE /api/teachers/{id}
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->teacherService->delete($id);

            return $this->success(null, 'Docente eliminado exitosamente');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->error('Docente no encontrado', null, 404);
        } catch (BusinessException $e) {
            return $this->error($e->getMessage(), null, 422);
        } catch (\Exception $e) {
            return $this->error('Error al eliminar docente: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get the authenticated teacher's weekly schedule.
     *
     * GET /api/teachers/my-schedule
     */
    public function mySchedule(Request $request): JsonResponse
    {
        $teacher = $request->user()->teacher;

        if (!$teacher) {
            return $this->error('No se encontró perfil de docente', null, 404);
        }

        return $this->success($teacher->getWeeklySchedule(), 'Horario obtenido exitosamente');
    }
}
