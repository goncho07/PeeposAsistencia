<?php

namespace App\Http\Controllers\Students;

use App\Http\Controllers\Controller;
use App\Http\Requests\Students\StudentStoreRequest;
use App\Http\Requests\Students\StudentUpdateRequest;
use App\Http\Resources\StudentResource;
use App\Services\StudentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function __construct(
        private StudentService $studentService
    ) {}

    /**
     * Display a listing of students
     *
     * GET /api/students
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $search = $request->query('search');
            $classroomId = $request->query('classroom_id');

            $students = $this->studentService->getAllStudents($search, $classroomId);

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
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        try {
            $student = $this->studentService->findById($id);

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
