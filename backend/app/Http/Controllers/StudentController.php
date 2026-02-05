<?php

namespace App\Http\Controllers;

use App\Exceptions\BusinessException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Students\StudentStoreRequest;
use App\Http\Requests\Students\StudentUpdateRequest;
use App\Http\Resources\StudentResource;
use App\Services\StudentService;
use App\Traits\HasExpandableRelations;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    use HasExpandableRelations;

    public function __construct(
        private StudentService $studentService
    ) {}

    /**
     * Display a listing of students
     *
     * GET /api/students
     * GET /api/students?search=peeporana
     * GET /api/students?expand=classroom
     * GET /api/students?expand=classroom,parents
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $search = $request->query('search');
            $classroomId = $request->query('classroom_id');
            $expand = $this->parseExpand($request);

            $students = $this->studentService->getAllStudents($search, $classroomId, $expand);

            return $this->success(
                StudentResource::collection($students),
                'Estudiantes obtenidos exitosamente'
            );
        } catch (\Exception $e) {
            return $this->error('Error al obtener estudiantes: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Display the specified student
     *
     * GET /api/students/{id}
     * GET /api/students/{id}?expand=classroom,parents
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $expand = $this->parseExpand($request);
            $student = $this->studentService->findById($id, $expand);

            return $this->success(
                new StudentResource($student),
                'Estudiante obtenido exitosamente'
            );
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->error('Estudiante no encontrado', null, 404);
        } catch (\Exception $e) {
            return $this->error('Error al obtener estudiante: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Store a newly created student
     *
     * POST /api/students
     *
     * @param StudentStoreRequest $request
     * @return JsonResponse
     */
    public function store(StudentStoreRequest $request): JsonResponse
    {
        try {
            $student = $this->studentService->create($request->validated());

            return $this->created(
                new StudentResource($student),
                'Estudiante creado exitosamente'
            );
        } catch (BusinessException $e) {
            return $this->error($e->getMessage(), null, 422);
        } catch (\Exception $e) {
            return $this->error('Error al crear estudiante: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Update the specified student
     *
     * PUT/PATCH /api/students/{id}
     *
     * @param StudentUpdateRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(StudentUpdateRequest $request, int $id): JsonResponse
    {
        try {
            $student = $this->studentService->update($id, $request->validated());

            return $this->success(
                new StudentResource($student),
                'Estudiante actualizado exitosamente'
            );
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->error('Estudiante no encontrado', null, 404);
        } catch (BusinessException $e) {
            return $this->error($e->getMessage(), null, 422);
        } catch (\Exception $e) {
            return $this->error('Error al actualizar estudiante: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Remove the specified student
     *
     * DELETE /api/students/{id}
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->studentService->delete($id);

            return $this->success(null, 'Estudiante eliminado exitosamente');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->error('Estudiante no encontrado', null, 404);
        } catch (\Exception $e) {
            return $this->error('Error al eliminar estudiante: ' . $e->getMessage(), null, 500);
        }
    }
}
