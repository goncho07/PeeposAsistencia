<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\Justification;
use App\Exceptions\BusinessException;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

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
            $tenantId = Auth::user()->tenant_id;

            $existing = Attendance::where('tenant_id', $tenantId)
                ->where('attendable_type', get_class($attendable))
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
            $nivel = $attendable instanceof Student ? $attendable->classroom->level : $attendable->level;
            $shift = $attendable instanceof Student ? $attendable->classroom->shift : 'MAÑANA';
            $schedule = $this->settingService->getScheduleForLevel($nivel, $shift, $tenantId);
            $toleranceMinutes = $this->settingService->getToleranceMinutes($tenantId);

            $entryTimeLimit = Carbon::parse($schedule['entrada'])->addMinutes($toleranceMinutes);
            $status = $now->format('H:i') <= $entryTimeLimit->format('H:i') ? 'COMPLETO' : 'TARDANZA';

            if ($existing) {
                $existing->update([
                    'entry_time' => $now,
                    'entry_status' => $status,
                ]);
                $attendance = $existing;
            } else {
                $attendance = Attendance::create([
                    'tenant_id' => $tenantId,
                    'attendable_type' => get_class($attendable),
                    'attendable_id' => $attendable->id,
                    'date' => $today,
                    'shift' => $shift,
                    'entry_time' => $now,
                    'entry_status' => $status,
                    'whatsapp_sent' => false,
                ]);
            }

            if ($attendable instanceof Student) {
                $this->whatsAppService->sendAttendanceNotification($attendable, $attendance, 'ENTRADA');
            }

            return [
                'success' => true,
                'message' => $this->getEntryMessage($attendable, $status, $now),
                'attendance' => $attendance,
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
            $tenantId = Auth::user()->tenant_id;

            $attendance = Attendance::where('tenant_id', $tenantId)
                ->where('attendable_type', get_class($attendable))
                ->where('attendable_id', $attendable->id)
                ->where('date', $today)
                ->first();

            if (!$attendance || !$attendance->entry_time) {
                throw new BusinessException(
                    'No se puede registrar salida sin entrada previa para ' . $attendable->full_name
                );
            }

            if ($attendance->exit_time) {
                throw new BusinessException(
                    'Ya se registró la salida de ' . $attendable->full_name .
                        ' a las ' . $attendance->exit_time->format('H:i')
                );
            }

            $now = now();
            $nivel = $attendable instanceof Student ? $attendable->classroom->level : $attendable->level;
            $shift = $attendable instanceof Student ? $attendable->classroom->shift : 'MAÑANA';
            $schedule = $this->settingService->getScheduleForLevel($nivel, $shift, $tenantId);

            $exitTimeLimit = Carbon::parse($schedule['salida']);
            $status = $now->format('H:i') >= $exitTimeLimit->format('H:i')
                ? 'COMPLETO'
                : 'SALIDA_ANTICIPADA';

            $attendance->update([
                'exit_time' => $now,
                'exit_status' => $status,
            ]);

            if ($attendable instanceof Student) {
                $this->whatsAppService->sendAttendanceNotification($attendable, $attendance, 'SALIDA');
            }

            return [
                'success' => true,
                'message' => $this->getExitMessage($attendable, $status, $now),
                'attendance' => $attendance,
                'person' => $attendable,
            ];
        });
    }

    public function getDailyStats(?Carbon $date = null): array
    {
        $date = $date ?? now();
        $tenantId = Auth::user()->tenant_id;

        $students = Attendance::where('tenant_id', $tenantId)
            ->students()
            ->forDate($date)
            ->get();

        $teachers = Attendance::where('tenant_id', $tenantId)
            ->teachers()
            ->forDate($date)
            ->get();

        return [
            'date' => $date->format('Y-m-d'),
            'students' => [
                'total_registered' => Student::where('tenant_id', $tenantId)->count(),
                'present' => $students->whereIn('entry_status', ['COMPLETO', 'TARDANZA'])->count(),
                'late' => $students->where('entry_status', 'TARDANZA')->count(),
                'absent' => $students->whereIn('entry_status', 'FALTA')->count(),
                'justified' => $students->where('entry_status', 'FALTA_JUSTIFICADA')->count(),
            ],
            'teachers' => [
                'total_registered' => Teacher::where('tenant_id', $tenantId)->count(),
                'present' => $teachers->whereIn('entry_status', ['COMPLETO', 'TARDANZA'])->count(),
                'late' => $teachers->where('entry_status', 'TARDANZA')->count(),
                'absent' => $teachers->whereIn('entry_status', 'FALTA')->count(),
            ],
            'notifications_sent' => Attendance::where('tenant_id', $tenantId)
                ->forDate($date)
                ->where('whatsapp_sent', true)
                ->count(),
        ];
    }

    public function applyJustifications(Carbon $date): void
    {
        $tenantId = Auth::user()->tenant_id;

        $justifications = Justification::where('tenant_id', $tenantId)
            ->where('date_from', '<=', $date)
            ->where('date_to', '>=', $date)
            ->get();

        foreach ($justifications as $justification) {
            $attendance = Attendance::where('tenant_id', $tenantId)
                ->where('attendable_type', $justification->justifiable_type)
                ->where('attendable_id', $justification->justifiable_id)
                ->where('date', $date)
                ->first();

            if ($attendance) {
                if ($justification->type === 'FALTA') {
                    $attendance->update(['entry_status' => 'FALTA_JUSTIFICADA']);
                } elseif ($justification->type === 'SALIDA_ANTICIPADA') {
                    $attendance->update(['exit_status' => 'SALIDA_ANTICIPADA_JUSTIFICADA']);
                }
            }
        }
    }

    public function generateAbsences(Carbon $date): void
    {
        $tenantId = Auth::user()->tenant_id;

        if (!$this->settingService->isAttendanceDay(strtolower($date->locale('es')->dayName), $tenantId)) {
            return;
        }

        $studentIds = Attendance::where('tenant_id', $tenantId)
            ->students()
            ->forDate($date)
            ->pluck('attendable_id');

        $absentStudents = Student::where('tenant_id', $tenantId)
            ->whereNotIn('id', $studentIds)
            ->get();

        foreach ($absentStudents as $student) {
            Attendance::create([
                'tenant_id' => $tenantId,
                'attendable_type' => Student::class,
                'attendable_id' => $student->id,
                'date' => $date,
                'shift' => $student->classroom->shift ?? 'MAÑANA',
                'entry_status' => 'FALTA',
                'exit_status' => 'SIN_SALIDA',
            ]);
        }

        $teacherIds = Attendance::where('tenant_id', $tenantId)
            ->teachers()
            ->forDate($date)
            ->pluck('attendable_id');

        $absentTeachers = Teacher::where('tenant_id', $tenantId)
            ->whereNotIn('id', $teacherIds)
            ->get();

        foreach ($absentTeachers as $teacher) {
            Attendance::create([
                'tenant_id' => $tenantId,
                'attendable_type' => Teacher::class,
                'attendable_id' => $teacher->id,
                'date' => $date,
                'shift' => 'MAÑANA',
                'entry_status' => 'FALTA',
                'exit_status' => 'SIN_SALIDA',
                'whatsapp_sent' => false,
            ]);
        }

        $this->applyJustifications($date);
    }

    private function findByQRCode(string $qrCode)
    {
        $tenantId = Auth::user()->tenant_id;

        $student = Student::where('tenant_id', $tenantId)
            ->where('qr_code', $qrCode)
            ->first();

        if ($student) return $student;

        return Teacher::where('tenant_id', $tenantId)
            ->where('qr_code', $qrCode)
            ->first();
    }

    private function getEntryMessage($attendable, string $status, Carbon $time): string
    {
        $name = $attendable->full_name;
        $hora = $time->format('h:i A');
        $type = $attendable instanceof Student ? 'Estudiante' : 'Docente';

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
        $type = $attendable instanceof Student ? 'Estudiante' : 'Docente';

        return match ($status) {
            'COMPLETO' => "✅ {$type}: {$name} - Salida registrada a las {$hora}",
            'SALIDA_ANTICIPADA' => "⚠️ {$type}: {$name} - Salida anticipada a las {$hora}",
            default => "📤 {$type}: {$name} - Salida registrada"
        };
    }
}
