<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\Justification;
use App\Exceptions\BusinessException;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AttendanceService
{
    public function __construct(
        private SettingService $settingService,
        private WhatsAppService $whatsAppService
    ) {}

    /**
     * Register entry attendance by scanning QR code
     *
     * @param string $qrCode The QR code from student or teacher carnet
     * @param int $userId The ID of the user registering the attendance
     * @return array Contains success status, message, attendance record, and person
     * @throws BusinessException If QR is invalid or entry already registered
     */
    public function scanEntry(string $qrCode, int $userId): array
    {
        return DB::transaction(function () use ($qrCode, $userId) {
            $attendable = $this->findByQRCode($qrCode);

            if (!$attendable) {
                throw new BusinessException('Código QR no válido');
            }

            $today = now()->startOfDay();

            $existing = Attendance::where('attendable_type', get_class($attendable))
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

            $schedule = $this->settingService->getScheduleForLevel($nivel, $shift);
            $toleranceMinutes = $this->settingService->getToleranceMinutes();

            $entryTimeLimit = Carbon::parse($schedule['entrada'])->addMinutes($toleranceMinutes);
            $status = $now->format('H:i') <= $entryTimeLimit->format('H:i') ? 'COMPLETO' : 'TARDANZA';

            if ($existing) {
                $existing->update([
                    'entry_time' => $now,
                    'entry_status' => $status,
                    'recorded_by' => $userId,
                    'device_type' => 'SCANNER',
                ]);
                $attendance = $existing;
            } else {
                $attendance = Attendance::create([
                    'attendable_type' => get_class($attendable),
                    'attendable_id' => $attendable->id,
                    'date' => $today,
                    'shift' => $shift,
                    'entry_time' => $now,
                    'entry_status' => $status,
                    'recorded_by' => $userId,
                    'device_type' => 'SCANNER',
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

    /**
     * Register exit attendance by scanning QR code
     *
     * @param string $qrCode The QR code from student or teacher carnet
     * @param int $userId The ID of the user registering the attendance
     * @return array Contains success status, message, attendance record, and person
     * @throws BusinessException If QR is invalid, no entry found, or exit already registered
     */
    public function scanExit(string $qrCode, int $userId): array
    {
        return DB::transaction(function () use ($qrCode, $userId) {
            $attendable = $this->findByQRCode($qrCode);

            if (!$attendable) {
                throw new BusinessException('Código QR no válido');
            }

            $today = now()->startOfDay();

            $attendance = Attendance::where('attendable_type', get_class($attendable))
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
            
            $schedule = $this->settingService->getScheduleForLevel($nivel, $shift);

            $exitTimeLimit = Carbon::parse($schedule['salida']);
            $status = $now->format('H:i') >= $exitTimeLimit->format('H:i')
                ? 'COMPLETO'
                : 'SALIDA_ANTICIPADA';

            $attendance->update([
                'exit_time' => $now,
                'exit_status' => $status,
                'recorded_by' => $userId,
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

    /**
     * Get daily attendance statistics for students and teachers
     *
     * @param Carbon|null $date The date to get stats for (defaults to today)
     * @return array Statistics including present, late, absent counts for students and teachers
     */
    public function getDailyStats(?Carbon $date = null): array
    {
        $date = $date ?? now();

        $students = Attendance::students()
            ->forDate($date)
            ->get();

        $teachers = Attendance::teachers()
            ->forDate($date)
            ->get();

        return [
            'date' => $date->format('Y-m-d'),
            'students' => [
                'total_registered' => Student::count(),
                'present' => $students->whereIn('entry_status', 'COMPLETO')->count(),
                'late' => $students->where('entry_status', 'TARDANZA')->count(),
                'absent' => $students->whereIn('entry_status', 'FALTA')->count(),
                'justified' => $students->where('entry_status', 'FALTA_JUSTIFICADA')->count(),
            ],
            'teachers' => [
                'total_registered' => Teacher::count(),
                'present' => $teachers->whereIn('entry_status', 'COMPLETO')->count(),
                'late' => $teachers->where('entry_status', 'TARDANZA')->count(),
                'absent' => $teachers->whereIn('entry_status', 'FALTA')->count(),
            ],
            'notifications_sent' => Attendance::forDate($date)
                ->where('whatsapp_sent', true)
                ->count(),
        ];
    }

    /**
     * Apply justifications to attendance records for a specific date
     *
     * Updates attendance status to justified for absences or early exits
     *
     * @param Carbon $date The date to apply justifications for
     * @return void
     */
    public function applyJustifications(Carbon $date): void
    {
        $justifications = Justification::where('date_from', '<=', $date)
            ->where('date_to', '>=', $date)
            ->get();

        foreach ($justifications as $justification) {
            $attendance = Attendance::where('attendable_type', $justification->justifiable_type)
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

    /**
     * Generate absence records for students and teachers who didn't attend
     *
     * Creates attendance records with 'FALTA' status for all students and teachers
     * who don't have an entry for the specified date. Then applies justifications.
     *
     * @param Carbon $date The date to generate absences for
     * @return void
     */
    public function generateAbsences(Carbon $date): void
    {
        if (!$this->settingService->isAttendanceDay(strtolower($date->locale('es')->dayName))) {
            return;
        }

        $studentIds = Attendance::students()
            ->forDate($date)
            ->pluck('attendable_id');

        $absentStudents = Student::whereNotIn('id', $studentIds)
            ->get();

        foreach ($absentStudents as $student) {
            $attendance = Attendance::create([
                'attendable_type' => Student::class,
                'attendable_id' => $student->id,
                'date' => $date,
                'shift' => $student->classroom->shift ?? 'MAÑANA',
                'entry_status' => 'FALTA',
                'exit_status' => 'SIN_SALIDA',
                'device_type' => 'IMPORTACION',
                'whatsapp_sent' => false,
            ]);

            if ($this->settingService->shouldSendWhatsAppOnAbsence()) {
                $this->whatsAppService->sendAbsenceNotification($student, $attendance);
            }
        }

        $teacherIds = Attendance::teachers()
            ->forDate($date)
            ->pluck('attendable_id');

        $absentTeachers = Teacher::whereNotIn('id', $teacherIds)
            ->get();

        foreach ($absentTeachers as $teacher) {
            Attendance::create([
                'attendable_type' => Teacher::class,
                'attendable_id' => $teacher->id,
                'date' => $date,
                'shift' => 'MAÑANA',
                'entry_status' => 'FALTA',
                'exit_status' => 'SIN_SALIDA',
                'device_type' => 'IMPORTACION',
                'whatsapp_sent' => false,
            ]);
        }

        $this->applyJustifications($date);
    }

    /**
     * Find student or teacher by QR code
     *
     * @param string $qrCode The QR code to search for
     * @return Student|Teacher|null The found student or teacher, or null if not found
     */
    private function findByQRCode(string $qrCode)
    {
        $student = Student::where('qr_code', $qrCode)
            ->first();

        if ($student) return $student;

        return Teacher::where('qr_code', $qrCode)
            ->first();
    }

    /**
     * Build entry message for attendance response
     *
     * @param Student|Teacher $attendable The student or teacher
     * @param string $status The entry status (ASISTIO, TARDANZA, etc.)
     * @param Carbon $time The entry time
     * @return string Formatted message
     */
    private function getEntryMessage($attendable, string $status, Carbon $time): string
    {
        $name = $attendable->full_name;
        $hora = $time->format('h:i A');
        $type = $attendable instanceof Student ? 'Estudiante' : 'Docente';

        return match ($status) {
            'ASISTIO' => "{$type}: {$name} - Entrada registrada a las {$hora}",
            'TARDANZA' => "{$type}: {$name} - Tardanza registrada a las {$hora}",
            default => "{$type}: {$name} - Entrada registrada"
        };
    }

    /**
     * Build exit message for attendance response
     *
     * @param Student|Teacher $attendable The student or teacher
     * @param string $status The exit status (COMPLETO, SALIDA_ANTICIPADA, etc.)
     * @param Carbon $time The exit time
     * @return string Formatted message
     */
    private function getExitMessage($attendable, string $status, Carbon $time): string
    {
        $name = $attendable->full_name;
        $hora = $time->format('h:i A');
        $type = $attendable instanceof Student ? 'Estudiante' : 'Docente';

        return match ($status) {
            'COMPLETO' => "{$type}: {$name} - Salida registrada a las {$hora}",
            'SALIDA_ANTICIPADA' => "{$type}: {$name} - Salida anticipada a las {$hora}",
            default => "{$type}: {$name} - Salida registrada"
        };
    }
}
