<?php

namespace App\Services;

use App\Models\Incident;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class IncidentService
{
    use LogsActivity;

    public function __construct(
        protected AcademicYearService $academicYearService
    ) {}

    private array $defaultRelations = ['classroom', 'student', 'reporter'];

    /**
     * Get all incidents for the current academic year with optional filters.
     */
    public function getAllIncidents(array $filters = []): Collection
    {
        $query = Incident::with($this->defaultRelations);

        $currentYear = $this->academicYearService->getCurrentYear();
        if ($currentYear) {
            $query->byAcademicYear($currentYear->id);
        }

        $this->applyFilters($query, $filters);

        return $query
            ->latest('date')
            ->latest('time')
            ->get();
    }

    /**
     * Find incident by ID.
     */
    public function findById(int $id): Incident
    {
        return Incident::with($this->defaultRelations)->findOrFail($id);
    }

    /**
     * Create a new incident. Date and time are auto-set to now.
     */
    public function create(array $data): Incident
    {
        return DB::transaction(function () use ($data) {
            $data['tenant_id'] = Auth::user()->tenant_id;
            $data['reported_by'] = Auth::id();
            $data['date'] = now()->toDateString();
            $data['time'] = now()->format('H:i');
            $data['severity'] = Incident::getSeverityForType($data['type']);
            $data['academic_year_id'] = $this->academicYearService->getCurrentYear()?->id;

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

            $oldValues = $incident->only(['severity', 'description']);

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
     * Get incidents for a specific student in the current academic year.
     */
    public function getByStudent(int $studentId): Collection
    {
        $query = Incident::with(['classroom', 'reporter'])
            ->byStudent($studentId);

        $currentYear = $this->academicYearService->getCurrentYear();
        if ($currentYear) {
            $query->byAcademicYear($currentYear->id);
        }

        return $query
            ->latest('date')
            ->latest('time')
            ->get();
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

        if (!empty($filters['date'])) {
            $query->forDate($filters['date']);
        }

        if (!empty($filters['date_from']) && !empty($filters['date_to'])) {
            $query->betweenDates($filters['date_from'], $filters['date_to']);
        }
    }
}
