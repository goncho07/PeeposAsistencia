<?php

namespace App\Services;

use App\Models\AcademicYear;
use App\Models\Bimester;
use App\Models\Tenant;
use App\Traits\LogsActivity;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AcademicYearService
{
    use LogsActivity;

    /**
     * Get the current academic year for the tenant.
     * This is the single source of truth — replaces all now()->year calls.
     */
    public function getCurrentYear(?int $tenantId = null): AcademicYear
    {
        $tenant = $this->resolveTenant($tenantId);

        if ($tenant->current_academic_year_id) {
            return $tenant->currentAcademicYear;
        }

        return AcademicYear::where('tenant_id', $tenant->id)
            ->whereIn('status', ['ACTIVO', 'FINALIZADO'])
            ->orderByDesc('year')
            ->firstOrFail();
    }

    /**
     * Get the current academic year number (integer).
     * Backward-compatible replacement for now()->year.
     */
    public function getCurrentYearNumber(?int $tenantId = null): int
    {
        return $this->getCurrentYear($tenantId)->year;
    }

    /**
     * Get the current bimester for a given date, or null if in vacation.
     */
    public function getCurrentBimester(?Carbon $date = null, ?int $tenantId = null): ?Bimester
    {
        $date = $date ?? now();
        $tenant = $this->resolveTenant($tenantId);

        return Bimester::where('tenant_id', $tenant->id)
            ->containingDate($date)
            ->first();
    }

    /**
     * Get bimester by number for the current (or specific) academic year.
     */
    public function getBimesterByNumber(int $number, ?int $academicYearId = null, ?int $tenantId = null): Bimester
    {
        if (!$academicYearId) {
            $academicYearId = $this->getCurrentYear($tenantId)->id;
        }

        return Bimester::where('academic_year_id', $academicYearId)
            ->where('number', $number)
            ->firstOrFail();
    }

    /**
     * Find which academic year a date belongs to.
     */
    public function getAcademicYearForDate(Carbon $date, ?int $tenantId = null): ?AcademicYear
    {
        $tenant = $this->resolveTenant($tenantId);

        return AcademicYear::where('tenant_id', $tenant->id)
            ->where('start_date', '<=', $date)
            ->where('end_date', '>=', $date)
            ->first();
    }

    /**
     * List all academic years for a tenant.
     */
    public function getAll(?int $tenantId = null)
    {
        $tenant = $this->resolveTenant($tenantId);

        return AcademicYear::where('tenant_id', $tenant->id)
            ->with('bimesters')
            ->orderByDesc('year')
            ->get();
    }

    /**
     * Get a specific academic year by ID with bimesters.
     */
    public function findById(int $id): AcademicYear
    {
        return AcademicYear::with('bimesters')->findOrFail($id);
    }

    /**
     * Create a new academic year with its 4 bimesters.
     */
    public function create(array $data, ?int $tenantId = null): AcademicYear
    {
        $tenant = $this->resolveTenant($tenantId);

        return DB::transaction(function () use ($data, $tenant) {
            $academicYear = AcademicYear::create([
                'tenant_id' => $tenant->id,
                'year' => $data['year'],
                'start_date' => $data['bimesters'][0]['start_date'],
                'end_date' => $data['bimesters'][3]['end_date'],
                'status' => 'PLANIFICADO',
                'is_current' => false,
            ]);

            foreach ($data['bimesters'] as $index => $bimester) {
                Bimester::create([
                    'tenant_id' => $tenant->id,
                    'academic_year_id' => $academicYear->id,
                    'number' => $index + 1,
                    'start_date' => $bimester['start_date'],
                    'end_date' => $bimester['end_date'],
                ]);
            }

            $academicYear->load('bimesters');

            $this->logActivity('academic_year_created', $academicYear, [
                'year' => $academicYear->year,
            ]);

            return $academicYear;
        });
    }

    /**
     * Update an academic year and its bimesters.
     */
    public function update(int $id, array $data): AcademicYear
    {
        return DB::transaction(function () use ($id, $data) {
            $academicYear = AcademicYear::findOrFail($id);

            if (isset($data['bimesters'])) {
                foreach ($data['bimesters'] as $bimesterData) {
                    Bimester::where('academic_year_id', $academicYear->id)
                        ->where('number', $bimesterData['number'])
                        ->update([
                            'start_date' => $bimesterData['start_date'],
                            'end_date' => $bimesterData['end_date'],
                        ]);
                }

                $academicYear->update([
                    'start_date' => $data['bimesters'][0]['start_date'],
                    'end_date' => end($data['bimesters'])['end_date'],
                ]);
            }

            $academicYear->load('bimesters');

            $this->logActivity('academic_year_updated', $academicYear, [
                'year' => $academicYear->year,
            ]);

            return $academicYear;
        });
    }

    /**
     * Activate an academic year — sets it as current for the tenant.
     */
    public function activate(int $id): AcademicYear
    {
        return DB::transaction(function () use ($id) {
            $academicYear = AcademicYear::findOrFail($id);

            AcademicYear::where('tenant_id', $academicYear->tenant_id)
                ->where('is_current', true)
                ->where('id', '!=', $id)
                ->update([
                    'is_current' => false,
                    'status' => 'FINALIZADO',
                ]);

            $academicYear->update([
                'status' => 'ACTIVO',
                'is_current' => true,
            ]);

            Tenant::where('id', $academicYear->tenant_id)
                ->update(['current_academic_year_id' => $academicYear->id]);

            $this->logActivity('academic_year_activated', $academicYear, [
                'year' => $academicYear->year,
            ]);

            return $academicYear->fresh('bimesters');
        });
    }

    /**
     * Finalize an academic year.
     */
    public function finalize(int $id): AcademicYear
    {
        $academicYear = AcademicYear::findOrFail($id);

        $academicYear->update([
            'status' => 'FINALIZADO',
            'is_current' => false,
        ]);

        $this->logActivity('academic_year_finalized', $academicYear, [
            'year' => $academicYear->year,
        ]);

        return $academicYear;
    }

    /**
     * Bulk-create an academic year with bimesters for all active tenants.
     * Used by superadmin to apply the same year structure globally.
     *
     * Returns summary: { created: int, skipped: int, errors: string[] }
     */
    public function bulkCreateForAllTenants(array $data): array
    {
        $tenants = Tenant::where('is_active', true)->get();
        $created = 0;
        $skipped = 0;
        $errors = [];

        foreach ($tenants as $tenant) {
            $exists = AcademicYear::where('tenant_id', $tenant->id)
                ->where('year', $data['year'])
                ->exists();

            if ($exists) {
                $skipped++;
                continue;
            }

            try {
                $this->create($data, $tenant->id);
                $created++;
            } catch (\Exception $e) {
                $errors[] = "{$tenant->name}: {$e->getMessage()}";
            }
        }

        return compact('created', 'skipped', 'errors');
    }

    /**
     * Resolve tenant from ID or current auth context.
     */
    private function resolveTenant(?int $tenantId = null): Tenant
    {
        if ($tenantId) {
            return Tenant::findOrFail($tenantId);
        }

        return Tenant::findOrFail(app('current_tenant_id'));
    }
}
