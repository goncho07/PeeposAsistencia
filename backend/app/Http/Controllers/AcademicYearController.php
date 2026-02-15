<?php

namespace App\Http\Controllers;

use App\Services\AcademicYearService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AcademicYearController extends Controller
{
    public function __construct(
        private AcademicYearService $academicYearService
    ) {}

    /**
     * List all academic years for the tenant.
     *
     * GET /api/academic-years
     */
    public function index(): JsonResponse
    {
        $years = $this->academicYearService->getAll();

        return $this->success($years, 'Años académicos obtenidos exitosamente');
    }

    /**
     * Get the current academic year with bimesters.
     *
     * GET /api/academic-years/current
     */
    public function current(): JsonResponse
    {
        try {
            $year = $this->academicYearService->getCurrentYear();
            $year->load('bimesters');

            return $this->success($year);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->error('No hay un año académico configurado.', null, 404);
        }
    }

    /**
     * Get a specific academic year.
     *
     * GET /api/academic-years/{id}
     */
    public function show(int $id): JsonResponse
    {
        try {
            $year = $this->academicYearService->findById($id);

            return $this->success($year);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->error('Año académico no encontrado.', null, 404);
        }
    }

    /**
     * Create a new academic year with 4 bimesters.
     *
     * POST /api/academic-years
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'year' => 'required|integer|min:2020|max:2099',
            'bimesters' => 'required|array|size:4',
            'bimesters.*.start_date' => 'required|date',
            'bimesters.*.end_date' => 'required|date|after:bimesters.*.start_date',
        ]);

        try {
            $year = $this->academicYearService->create($validated);

            return $this->created($year, 'Año académico creado exitosamente');
        } catch (\Exception $e) {
            return $this->error('Error al crear año académico: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Update an academic year and its bimesters.
     *
     * PUT /api/academic-years/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'bimesters' => 'required|array|size:4',
            'bimesters.*.number' => 'required|integer|min:1|max:4',
            'bimesters.*.start_date' => 'required|date',
            'bimesters.*.end_date' => 'required|date|after:bimesters.*.start_date',
        ]);

        try {
            $year = $this->academicYearService->update($id, $validated);

            return $this->success($year, 'Año académico actualizado exitosamente');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->error('Año académico no encontrado.', null, 404);
        }
    }

    /**
     * Activate an academic year (set as current).
     *
     * POST /api/academic-years/{id}/activate
     */
    public function activate(int $id): JsonResponse
    {
        try {
            $year = $this->academicYearService->activate($id);

            return $this->success($year, "Año académico {$year->year} activado exitosamente");
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->error('Año académico no encontrado.', null, 404);
        }
    }

    /**
     * Finalize an academic year.
     *
     * POST /api/academic-years/{id}/finalize
     */
    public function finalize(int $id): JsonResponse
    {
        try {
            $year = $this->academicYearService->finalize($id);

            return $this->success($year, "Año académico {$year->year} finalizado");
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->error('Año académico no encontrado.', null, 404);
        }
    }
}
