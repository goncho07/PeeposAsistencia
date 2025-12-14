<?php

namespace App\Services;

use App\Models\Asistencia;
use App\Models\Estudiante;
use App\Models\Docente;
use App\Models\Justificacion;
use App\Exceptions\BusinessException;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AttendanceService
{
    public function __construct(
        private SettingService $settingService,
        private WhatsAppService $whatsAppService
    ) {}

    public function scanEntry(string $qrCode, int $userId): array
    {
        return DB::transaction(function () use ($qrCode, $userId) {
            $attendable = $this->findByQRCode($qrCode);

            if (!$attendable) {
                throw new BusinessException('Código QR no válido');
            }

            $today = now()->startOfDay();

            $existing = Asistencia::where('attendable_type', get_class($attendable))
                ->where('attendable_id', $attendable->id)
                ->where('date', $today)
                ->first();

            if ($existing && $existing->entry_time) {
                throw new BusinessException(
                    'Ya se registró la entrada de ' . $attendable->full_name .
                        ' a las ' . $existing->entry_time->format('H:i')
                );
            }

            $now = now();
            $nivel = $attendable instanceof Estudiante ? $attendable->aula->nivel : $attendable->nivel;
            $schedule = $this->settingService->getScheduleForLevel($nivel);
            $toleranceMinutes = $this->settingService->getToleranceMinutes();

            $entryTimeLimit = Carbon::parse($schedule['entrada'])->addMinutes($toleranceMinutes);
            $status = $now->format('H:i') <= $entryTimeLimit->format('H:i') ? 'ASISTIO' : 'TARDANZA';

            if ($existing) {
                $existing->update([
                    'entry_time' => $now,
                    'entry_status' => $status,
                ]);
                $asistencia = $existing;
            } else {
                $asistencia = Asistencia::create([
                    'attendable_type' => get_class($attendable),
                    'attendable_id' => $attendable->id,
                    'date' => $today,
                    'entry_time' => $now,
                    'entry_status' => $status,
                    'whatsapp_sent' => false,
                ]);
            }

            if ($attendable instanceof Estudiante) {
                $this->whatsAppService->sendAttendanceNotification($attendable, $asistencia, 'ENTRADA');
            }

            return [
                'success' => true,
                'message' => $this->getEntryMessage($attendable, $status, $now),
                'attendance' => $asistencia,
                'person' => $attendable,
            ];
        });
    }

    public function scanExit(string $qrCode, int $userId): array
    {
        return DB::transaction(function () use ($qrCode, $userId) {
            $attendable = $this->findByQRCode($qrCode);

            if (!$attendable) {
                throw new BusinessException('Código QR no válido');
            }

            $today = now()->startOfDay();

            $asistencia = Asistencia::where('attendable_type', get_class($attendable))
                ->where('attendable_id', $attendable->id)
                ->where('date', $today)
                ->first();

            if (!$asistencia || !$asistencia->entry_time) {
                throw new BusinessException(
                    'No se puede registrar salida sin entrada previa para ' . $attendable->full_name
                );
            }

            if ($asistencia->exit_time) {
                throw new BusinessException(
                    'Ya se registró la salida de ' . $attendable->full_name .
                        ' a las ' . $asistencia->exit_time->format('H:i')
                );
            }

            $now = now();
            $nivel = $attendable instanceof Estudiante ? $attendable->aula->nivel : $attendable->nivel;
            $schedule = $this->settingService->getScheduleForLevel($nivel);

            $exitTimeLimit = Carbon::parse($schedule['salida']);
            $status = $now->format('H:i') >= $exitTimeLimit->format('H:i')
                ? 'COMPLETO'
                : 'SALIDA_ANTICIPADA';

            $asistencia->update([
                'exit_time' => $now,
                'exit_status' => $status,
            ]);

            if ($attendable instanceof Estudiante) {
                $this->whatsAppService->sendAttendanceNotification($attendable, $asistencia, 'SALIDA');
            }

            return [
                'success' => true,
                'message' => $this->getExitMessage($attendable, $status, $now),
                'attendance' => $asistencia,
                'person' => $attendable,
            ];
        });
    }

    public function getDailyStats(?Carbon $date = null): array
    {
        $date = $date ?? now();

        $students = Asistencia::students()
            ->forDate($date)
            ->get();

        $teachers = Asistencia::teachers()
            ->forDate($date)
            ->get();

        return [
            'date' => $date->format('Y-m-d'),
            'students' => [
                'total_registered' => Estudiante::count(),
                'present' => $students->whereIn('entry_status', ['ASISTIO', 'TARDANZA'])->count(),
                'late' => $students->where('entry_status', 'TARDANZA')->count(),
                'absent' => $students->whereIn('entry_status', 'FALTA')->count(),
                'justified' => $students->where('entry_status', 'FALTA_JUSTIFICADA')->count(),
            ],
            'teachers' => [
                'total_registered' => Docente::count(),
                'present' => $teachers->whereIn('entry_status', ['ASISTIO', 'TARDANZA'])->count(),
                'late' => $teachers->where('entry_status', 'TARDANZA')->count(),
                'absent' => $teachers->whereIn('entry_status', 'FALTA')->count(),
            ],
            'notifications_sent' => Asistencia::forDate($date)->where('whatsapp_sent', true)->count(),
        ];
    }

    public function applyJustifications(Carbon $date): void
    {
        $justifications = Justificacion::approved()
            ->where('date_from', '<=', $date)
            ->where('date_to', '>=', $date)
            ->get();

        foreach ($justifications as $justification) {
            $asistencia = Asistencia::where('attendable_type', $justification->justifiable_type)
                ->where('attendable_id', $justification->justifiable_id)
                ->where('date', $date)
                ->first();

            if ($asistencia) {
                if ($justification->type === 'FALTA') {
                    $asistencia->update(['entry_status' => 'FALTA_JUSTIFICADA']);
                } elseif ($justification->type === 'SALIDA_ANTICIPADA') {
                    $asistencia->update(['exit_status' => 'SALIDA_ANTICIPADA_JUSTIFICADA']);
                }
            }
        }
    }

    public function generateAbsences(Carbon $date): void
    {
        if (!$this->settingService->isAttendanceDay(strtolower($date->locale('es')->dayName))) {
            return;
        }

        $studentIds = Asistencia::students()
            ->forDate($date)
            ->pluck('attendable_id');

        $absentStudents = Estudiante::whereNotIn('id', $studentIds)->get();

        foreach ($absentStudents as $student) {
            Asistencia::create([
                'attendable_type' => Estudiante::class,
                'attendable_id' => $student->id,
                'date' => $date,
                'entry_status' => 'FALTA',
                'exit_status' => 'SIN_SALIDA',
            ]);
        }

        $teacherIds = Asistencia::teachers()
            ->forDate($date)
            ->pluck('attendable_id');

        $absentTeachers = Docente::whereNotIn('id', $teacherIds)->get();

        foreach ($absentTeachers as $teacher) {
            Asistencia::create([
                'attendable_type' => Docente::class,
                'attendable_id' => $teacher->id,
                'date' => $date,
                'entry_status' => 'FALTA',
                'exit_status' => 'SIN_SALIDA',
                'whatsapp_sent' => false,
            ]);
        }

        $this->applyJustifications($date);
    }

    private function findByQRCode(string $qrCode)
    {
        $student = Estudiante::where('qr_code', $qrCode)->first();
        if ($student) return $student;

        return Docente::where('qr_code', $qrCode)->first();
    }

    private function getEntryMessage($attendable, string $status, Carbon $time): string
    {
        $name = $attendable->full_name;
        $hora = $time->format('h:i A');
        $type = $attendable instanceof Estudiante ? 'Estudiante' : 'Docente';

        return match ($status) {
            'ASISTIO' => "✅ {$type}: {$name} - Entrada registrada a las {$hora}",
            'TARDANZA' => "⏰ {$type}: {$name} - Tardanza registrada a las {$hora}",
            default => "📝 {$type}: {$name} - Entrada registrada"
        };
    }

    private function getExitMessage($attendable, string $status, Carbon $time): string
    {
        $name = $attendable->full_name;
        $hora = $time->format('h:i A');
        $type = $attendable instanceof Estudiante ? 'Estudiante' : 'Docente';

        return match ($status) {
            'COMPLETO' => "✅ {$type}: {$name} - Salida registrada a las {$hora}",
            'SALIDA_ANTICIPADA' => "⚠️ {$type}: {$name} - Salida anticipada a las {$hora}",
            default => "📤 {$type}: {$name} - Salida registrada"
        };
    }
}
