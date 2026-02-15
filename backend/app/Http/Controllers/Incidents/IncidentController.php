<?php

namespace App\Http\Controllers\Incidents;

use App\Exceptions\BusinessException;
use App\Http\Controllers\Controller;
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
     * Display a listing of incidents (current academic year).
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $request->only([
                'classroom_id',
                'student_id',
                'type',
                'severity',
                'date',
                'date_from',
                'date_to',
            ]);

            $incidents = $this->incidentService->getAllIncidents($filters);

            return $this->success(IncidentResource::collection($incidents));
        } catch (\Exception $e) {
            return $this->error('Error al obtener incidencias: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Store a newly created incident.
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
     * Get incidents by student.
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
}
