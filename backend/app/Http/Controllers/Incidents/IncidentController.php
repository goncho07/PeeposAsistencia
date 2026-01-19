<?php

namespace App\Http\Controllers\Incidents;

use App\Http\Controllers\Controller;
use App\Models\Incident;
use App\Models\Student;
use App\Http\Requests\Incidents\IncidentStoreRequest;
use App\Http\Requests\Incidents\IncidentUpdateRequest;
use App\Http\Resources\IncidentResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class IncidentController extends Controller
{
    /**
     * Display a listing of incidents.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Incident::with(['classroom', 'student', 'reporter', 'resolver']);

            if ($request->query('classroom_id')) {
                $query->byClassroom($request->query('classroom_id'));
            }

            if ($request->query('student_id')) {
                $query->byStudent($request->query('student_id'));
            }

            if ($request->query('type')) {
                $query->byType($request->query('type'));
            }

            if ($request->query('severity')) {
                $query->bySeverity($request->query('severity'));
            }

            if ($request->query('status')) {
                $query->byStatus($request->query('status'));
            }

            if ($request->query('date')) {
                $query->forDate($request->query('date'));
            }

            if ($request->query('date_from') && $request->query('date_to')) {
                $query->betweenDates($request->query('date_from'), $request->query('date_to'));
            }

            $incidents = $query->latest('date')->latest('time')->paginate(20);

            return $this->success(IncidentResource::collection($incidents)->response()->getData(true));
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
            $data = $request->validated();

            $student = Student::findOrFail($data['student_id']);
            if ($student->classroom_id !== (int) $data['classroom_id']) {
                return $this->error(
                    'El estudiante no pertenece al aula especificada',
                    null,
                    422
                );
            }

            $data['tenant_id'] = $request->user()->tenant_id;
            $data['reported_by'] = $request->user()->id;

            $incident = DB::transaction(function () use ($data) {
                return Incident::create($data);
            });

            $incident->load(['classroom', 'student', 'reporter']);

            return $this->created(
                new IncidentResource($incident),
                'Incidencia registrada exitosamente'
            );
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
            $incident = Incident::with(['classroom', 'student', 'reporter', 'resolver'])
                ->findOrFail($id);

            return $this->success(new IncidentResource($incident));
        } catch (\Exception $e) {
            return $this->error('Incidencia no encontrada', null, 404);
        }
    }

    /**
     * Update the specified incident.
     */
    public function update(IncidentUpdateRequest $request, int $id): JsonResponse
    {
        try {
            $incident = Incident::findOrFail($id);
            $data = $request->validated();

            if (isset($data['student_id']) && $data['student_id'] !== $incident->student_id) {
                $student = Student::findOrFail($data['student_id']);
                $classroomId = $data['classroom_id'] ?? $incident->classroom_id;
                if ($student->classroom_id !== $classroomId) {
                    return $this->error(
                        'El estudiante no pertenece al aula especificada',
                        null,
                        422
                    );
                }
            }

            if (isset($data['status']) && $data['status'] === 'RESUELTA' && $incident->status !== 'RESUELTA') {
                $data['resolved_by'] = $request->user()->id;
                $data['resolved_at'] = now();
            }

            DB::transaction(function () use ($incident, $data) {
                $incident->update($data);
            });

            $incident->load(['classroom', 'student', 'reporter', 'resolver']);

            return $this->success(
                new IncidentResource($incident),
                'Incidencia actualizada exitosamente'
            );
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
            $incident = Incident::findOrFail($id);

            DB::transaction(function () use ($incident) {
                $incident->delete();
            });

            return $this->success(null, 'Incidencia eliminada exitosamente');
        } catch (\Exception $e) {
            return $this->error('Error al eliminar incidencia: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get incident statistics for a classroom or period.
     */
    public function statistics(Request $request): JsonResponse
    {
        try {
            $query = Incident::query();

            if ($request->query('classroom_id')) {
                $query->byClassroom($request->query('classroom_id'));
            }

            if ($request->query('date_from') && $request->query('date_to')) {
                $query->betweenDates($request->query('date_from'), $request->query('date_to'));
            }

            $incidents = $query->get();

            $statistics = [
                'total' => $incidents->count(),
                'by_severity' => [
                    'LEVE' => $incidents->where('severity', 'LEVE')->count(),
                    'MODERADA' => $incidents->where('severity', 'MODERADA')->count(),
                    'GRAVE' => $incidents->where('severity', 'GRAVE')->count(),
                ],
                'by_status' => [
                    'REGISTRADA' => $incidents->where('status', 'REGISTRADA')->count(),
                    'EN_SEGUIMIENTO' => $incidents->where('status', 'EN_SEGUIMIENTO')->count(),
                    'RESUELTA' => $incidents->where('status', 'RESUELTA')->count(),
                ],
                'by_type' => $incidents->groupBy('type')->map->count(),
            ];

            return $this->success($statistics);
        } catch (\Exception $e) {
            return $this->error('Error al obtener estadísticas: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get incidents by student.
     */
    public function byStudent(int $studentId): JsonResponse
    {
        try {
            $incidents = Incident::with(['classroom', 'reporter', 'resolver'])
                ->byStudent($studentId)
                ->latest('date')
                ->latest('time')
                ->get();

            return $this->success(IncidentResource::collection($incidents));
        } catch (\Exception $e) {
            return $this->error('Error al obtener incidencias del estudiante: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get available incident types.
     */
    public function types(): JsonResponse
    {
        return $this->success(Incident::TYPES);
    }

    /**
     * Get available severities.
     */
    public function severities(): JsonResponse
    {
        return $this->success(Incident::SEVERITIES);
    }
}
