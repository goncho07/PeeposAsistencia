<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\Classroom;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class ReportService
{
    public function __construct(private SettingService $settingService) {}

    /**
     * Generate attendance report based on filters
     *
     * @param array $filters Report filters including period, type, level, grade, section, shift
     * @return array Report data with period, filters, statistics, and detailed records
     */
    public function generateReport(array $filters): array
    {
        [$from, $to] = $this->getPeriodDates($filters);

        $query = Attendance::whereBetween('date', [$from, $to]);

        if ($filters['type'] === 'student') {
            $query->students();

            if (isset($filters['level'])) {
                $query->whereHasMorph('attendable', [Student::class], function ($q) use ($filters) {
                    $q->whereHas('classroom', function ($classroomQuery) use ($filters) {
                        $classroomQuery->where('level', $filters['level']);

                            if (isset($filters['grade'])) {
                                $classroomQuery->where('grade', $filters['grade']);
                            }

                            if (isset($filters['section'])) {
                                $classroomQuery->where('section', $filters['section']);
                            }

                            if (isset($filters['shift'])) {
                                $classroomQuery->where('shift', $filters['shift']);
                            }
                        });
                });
            }
        } elseif ($filters['type'] === 'teacher') {
            $query->teachers();

            if (isset($filters['level'])) {
                $query->whereHasMorph('attendable', [Teacher::class], function ($q) use ($filters) {
                    $q->where('level', $filters['level']);
                });
            }
        }

        $attendances = $query->with(['attendable'])->get();

        return [
            'period' => [
                'from' => $from->format('Y-m-d'),
                'to' => $to->format('Y-m-d'),
                'type' => $filters['period'] ?? 'custom',
            ],
            'filters' => $filters,
            'statistics' => $this->calculateStatistics($attendances),
            'details' => $this->groupAttendancesByPerson($attendances),
        ];
    }

    /**
     * Get start and end dates for the report period
     *
     * @param array $filters Report filters
     * @return array Array containing [Carbon $from, Carbon $to]
     */
    private function getPeriodDates(array $filters): array
    {
        if (isset($filters['from']) && isset($filters['to'])) {
            return [
                Carbon::parse($filters['from']),
                Carbon::parse($filters['to'])
            ];
        }

        $now = now();

        return match ($filters['period'] ?? 'daily') {
            'daily' => [$now->copy()->startOfDay(), $now->copy()->endOfDay()],
            'weekly' => [$now->copy()->startOfWeek(), $now->copy()->endOfWeek()],
            'monthly' => [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()],
            'bimester' => $this->getBimesterPeriod($filters['bimester'] ?? $this->settingService->getCurrentBimester()),
            default => [$now->copy()->startOfDay(), $now->copy()->endOfDay()],
        };
    }

    /**
     * Get start and end dates for a specific bimester period
     *
     * @param int $bimester Bimester number (1-4)
     * @return array Array containing [Carbon $from, Carbon $to]
     */
    private function getBimesterPeriod(int $bimester): array
    {
        $dates = $this->settingService->getBimesterDates($bimester);
        return [
            Carbon::parse($dates['inicio']),
            Carbon::parse($dates['fin'])
        ];
    }

    /**
     * Calculate attendance statistics from a collection of attendance records
     *
     * @param Collection $attendances Collection of Attendance models
     * @return array Statistics including total records, present, late, absent, justified absences, and early exits
     */
    private function calculateStatistics(Collection $attendances): array
    {
        return [
            'total_records' => $attendances->count(),
            'present' => $attendances->whereIn('entry_status', 'COMPLETO')->count(),
            'late' => $attendances->where('entry_status', 'TARDANZA')->count(),
            'absent' => $attendances->where('entry_status', 'FALTA')->count(),
            'justified_absences' => $attendances->where('entry_status', 'FALTA_JUSTIFICADA')->count(),
            'early_exits' => $attendances->where('exit_status', 'SALIDA_ANTICIPADA')->count(),
            'justified_early_exits' => $attendances->where('exit_status', 'SALIDA_ANTICIPADA_JUSTIFICADA')->count(),
        ];
    }

    /**
     * Group attendance records by person (student or teacher) and calculate individual statistics
     *
     * @param Collection $attendances Collection of Attendance models
     * @return array Array of person objects with their attendance statistics and detailed records
     */
    private function groupAttendancesByPerson(Collection $attendances): array
    {
        return $attendances->groupBy(fn($a) => $a->attendable_id . '-' . $a->attendable_type)
            ->map(function ($group) {
                $person = $group->first()->attendable;

                return [
                    'id' => $person->id,
                    'name' => $person->full_name,
                    'type' => class_basename($person),
                    'document' => $person->dni ?? $person->document_number,
                    'statistics' => [
                        'total_days' => $group->count(),
                        'present' => $group->whereIn('entry_status', 'COMPLETO')->count(),
                        'late' => $group->where('entry_status', 'TARDANZA')->count(),
                        'absent' => $group->where('entry_status', 'FALTA')->count(),
                        'justified' => $group->where('entry_status', 'FALTA_JUSTIFICADA')->count(),
                    ],
                    'records' => $group->map(fn($a) => [
                        'date' => $a->date->format('Y-m-d'),
                        'entry_time' => $a->entry_time?->format('H:i'),
                        'exit_time' => $a->exit_time?->format('H:i'),
                        'entry_status' => $a->entry_status,
                        'exit_status' => $a->exit_status,
                    ])->values(),
                ];
            })
            ->values()
            ->toArray();
    }
}
