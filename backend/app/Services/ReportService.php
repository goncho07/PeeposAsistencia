<?php

namespace App\Services;

use App\Models\Asistencia;
use App\Models\Estudiante;
use App\Models\Docente;
use App\Models\Aula;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class ReportService
{
    public function __construct(private SettingService $settingService) {}

    public function generateReport(array $filters): array
    {
        [$from, $to] = $this->getPeriodDates($filters);

        $query = Asistencia::query()->forPeriod($from, $to);

        if ($filters['type'] === 'student') {
            $query->students();

            if (isset($filters['nivel'])) {
                $query->whereHasMorph('attendable', [Estudiante::class], function ($q) use ($filters) {
                    $q->whereHas('aula', function ($aulaQuery) use ($filters) {
                        $aulaQuery->where('nivel', $filters['nivel']);

                        if (isset($filters['grado'])) {
                            $aulaQuery->where('grado', $filters['grado']);
                        }

                        if (isset($filters['seccion'])) {
                            $aulaQuery->where('seccion', $filters['seccion']);
                        }
                    });
                });
            }
        } elseif ($filters['type'] === 'teacher') {
            $query->teachers();

            if (isset($filters['nivel'])) {
                $query->whereHasMorph('attendable', [Docente::class], function ($q) use ($filters) {
                    $q->where('nivel', $filters['nivel']);
                });
            }
        }

        $attendances = $query->with('attendable')->get();

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

    private function getBimesterPeriod(int $bimester): array
    {
        $dates = $this->settingService->getBimesterDates($bimester);
        return [
            Carbon::parse($dates['inicio']),
            Carbon::parse($dates['fin'])
        ];
    }

    private function calculateStatistics(Collection $attendances): array
    {
        return [
            'total_records' => $attendances->count(),
            'present' => $attendances->whereIn('entry_status', ['ASISTIO', 'TARDANZA'])->count(),
            'late' => $attendances->where('entry_status', 'TARDANZA')->count(),
            'absent' => $attendances->where('entry_status', 'FALTA')->count(),
            'justified_absences' => $attendances->where('entry_status', 'FALTA_JUSTIFICADA')->count(),
            'early_exits' => $attendances->where('exit_status', 'SALIDA_ANTICIPADA')->count(),
            'justified_early_exits' => $attendances->where('exit_status', 'SALIDA_ANTICIPADA_JUSTIFICADA')->count(),
        ];
    }

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
                        'present' => $group->whereIn('entry_status', ['ASISTIO', 'TARDANZA'])->count(),
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
