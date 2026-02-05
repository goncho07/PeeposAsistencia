<?php

namespace App\Services;

use App\Models\Incident;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class IncidentService
{
    use LogsActivity;

    private array $defaultRelations = ['classroom', 'student', 'reporter', 'resolver'];

    /**
     * Get all incidents with optional filters.
     */
    public function getAllIncidents(array $filters = []): LengthAwarePaginator
    {
        $query = Incident::with($this->defaultRelations);

        $this->applyFilters($query, $filters);

        return $query
            ->latest('date')
            ->latest('time')
            ->paginate($filters['per_page'] ?? 20);
    }

    /**
     * Find incident by ID.
     */
    public function findById(int $id): Incident
    {
        return Incident::with($this->defaultRelations)->findOrFail($id);
    }

    /**
     * Create a new incident.
     */
    public function create(array $data): Incident
    {
        return DB::transaction(function () use ($data) {
            $data['tenant_id'] = Auth::user()->tenant_id;
            $data['reported_by'] = Auth::id();

            $incident = Incident::create($data);

            $incident->load($this->defaultRelations);

            $this->logActivity('incident_created', $incident, [
                'type' => $incident->type,
                'severity' => $incident->severity,
                'student_id' => $incident->student_id,
            ]);

            return $incident;
        });
    }

    /**
     * Update an existing incident.
     */
    public function update(int $id, array $data): Incident
    {
        return DB::transaction(function () use ($id, $data) {
            $incident = Incident::findOrFail($id);

            $oldValues = $incident->only(['status', 'severity', 'description']);

            if (isset($data['status']) && $data['status'] === 'RESUELTA' && $incident->status !== 'RESUELTA') {
                $data['resolved_by'] = Auth::id();
                $data['resolved_at'] = now();
            }

            $incident->update($data);

            $incident->load($this->defaultRelations);

            $newValues = $incident->only(array_keys($oldValues));
            $this->logActivityWithChanges('incident_updated', $incident, $oldValues, $newValues);

            return $incident;
        });
    }

    /**
     * Delete an incident.
     */
    public function delete(int $id): void
    {
        DB::transaction(function () use ($id) {
            $incident = Incident::findOrFail($id);

            $this->logActivity('incident_deleted', $incident, [
                'type' => $incident->type,
                'student_id' => $incident->student_id,
            ]);

            $incident->delete();
        });
    }

    /**
     * Get incidents for a specific student.
     */
    public function getByStudent(int $studentId): Collection
    {
        return Incident::with(['classroom', 'reporter', 'resolver'])
            ->byStudent($studentId)
            ->latest('date')
            ->latest('time')
            ->get();
    }

    /**
     * Get incident statistics.
     */
    public function getStatistics(array $filters = []): array
    {
        $query = Incident::query();

        if (!empty($filters['classroom_id'])) {
            $query->byClassroom($filters['classroom_id']);
        }

        if (!empty($filters['date_from']) && !empty($filters['date_to'])) {
            $query->betweenDates($filters['date_from'], $filters['date_to']);
        }

        $incidents = $query->get();

        return [
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
    }

    /**
     * Apply filters to query.
     */
    private function applyFilters($query, array $filters): void
    {
        if (!empty($filters['classroom_id'])) {
            $query->byClassroom($filters['classroom_id']);
        }

        if (!empty($filters['student_id'])) {
            $query->byStudent($filters['student_id']);
        }

        if (!empty($filters['type'])) {
            $query->byType($filters['type']);
        }

        if (!empty($filters['severity'])) {
            $query->bySeverity($filters['severity']);
        }

        if (!empty($filters['status'])) {
            $query->byStatus($filters['status']);
        }

        if (!empty($filters['date'])) {
            $query->forDate($filters['date']);
        }

        if (!empty($filters['date_from']) && !empty($filters['date_to'])) {
            $query->betweenDates($filters['date_from'], $filters['date_to']);
        }
    }
}
