<?php

namespace App\Http\Controllers\Incidents;

use App\Exceptions\BusinessException;
use App\Http\Controllers\Controller;
use App\Models\Incident;
use App\Http\Requests\Incidents\IncidentStoreRequest;
use App\Http\Requests\Incidents\IncidentUpdateRequest;
use App\Http\Resources\IncidentResource;
use App\Services\IncidentService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class IncidentController extends Controller
{
    public function __construct(
        private IncidentService $incidentService
    ) {}

    /**
     * Display a listing of incidents.
     *
     * GET /api/incidents
     * GET /api/incidents?classroom_id=1
     * GET /api/incidents?student_id=1
     * GET /api/incidents?type=CONDUCTA
     * GET /api/incidents?severity=GRAVE
     * GET /api/incidents?status=REGISTRADA
     * GET /api/incidents?date=2024-01-15
     * GET /api/incidents?date_from=2024-01-01&date_to=2024-01-31
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $request->only([
                'classroom_id',
                'student_id',
                'type',
                'severity',
                'status',
                'date',
                'date_from',
                'date_to',
                'per_page',
            ]);

            $incidents = $this->incidentService->getAllIncidents($filters);

            return $this->success(
                IncidentResource::collection($incidents)->response()->getData(true)
            );
        } catch (\Exception $e) {
            return $this->error('Error al obtener incidencias: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Store a newly created incident.
     *
     * POST /api/incidents
     */
    public function store(IncidentStoreRequest $request): JsonResponse
    {
        try {
            $incident = $this->incidentService->create($request->validated());

            return $this->created(
                new IncidentResource($incident),
                'Incidencia registrada exitosamente'
            );
        } catch (BusinessException $e) {
            return $this->error($e->getMessage(), null, 422);
        } catch (\Exception $e) {
            return $this->error('Error al registrar incidencia: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Display the specified incident.
     *
     * GET /api/incidents/{id}
     */
    public function show(int $id): JsonResponse
    {
        try {
            $incident = $this->incidentService->findById($id);

            return $this->success(new IncidentResource($incident));
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->error('Incidencia no encontrada', null, 404);
        } catch (\Exception $e) {
            return $this->error('Error al obtener incidencia: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Update the specified incident.
     *
     * PUT/PATCH /api/incidents/{id}
     */
    public function update(IncidentUpdateRequest $request, int $id): JsonResponse
    {
        try {
            $incident = $this->incidentService->update($id, $request->validated());

            return $this->success(
                new IncidentResource($incident),
                'Incidencia actualizada exitosamente'
            );
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->error('Incidencia no encontrada', null, 404);
        } catch (BusinessException $e) {
            return $this->error($e->getMessage(), null, 422);
        } catch (\Exception $e) {
            return $this->error('Error al actualizar incidencia: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Remove the specified incident.
     *
     * DELETE /api/incidents/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->incidentService->delete($id);

            return $this->success(null, 'Incidencia eliminada exitosamente');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->error('Incidencia no encontrada', null, 404);
        } catch (\Exception $e) {
            return $this->error('Error al eliminar incidencia: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get incident statistics for a classroom or period.
     *
     * GET /api/incidents/statistics
     * GET /api/incidents/statistics?classroom_id=1
     * GET /api/incidents/statistics?date_from=2024-01-01&date_to=2024-01-31
     */
    public function statistics(Request $request): JsonResponse
    {
        try {
            $filters = $request->only(['classroom_id', 'date_from', 'date_to']);
            $statistics = $this->incidentService->getStatistics($filters);

            return $this->success($statistics);
        } catch (\Exception $e) {
            return $this->error('Error al obtener estadísticas: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get incidents by student.
     *
     * GET /api/incidents/student/{studentId}
     */
    public function byStudent(int $studentId): JsonResponse
    {
        try {
            $incidents = $this->incidentService->getByStudent($studentId);

            return $this->success(IncidentResource::collection($incidents));
        } catch (\Exception $e) {
            return $this->error('Error al obtener incidencias del estudiante: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get available incident types.
     *
     * GET /api/incidents/types
     */
    public function types(): JsonResponse
    {
        return $this->success(Incident::TYPES);
    }

    /**
     * Get available severities.
     *
     * GET /api/incidents/severities
     */
    public function severities(): JsonResponse
    {
        return $this->success(Incident::SEVERITIES);
    }
}
