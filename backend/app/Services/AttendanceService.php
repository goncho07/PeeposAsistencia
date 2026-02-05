<?php

namespace App\Services;

use App\Exceptions\BiometricException;
use App\Models\Attendance;
use App\Models\FaceEmbedding;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\Justification;
use App\Exceptions\BusinessException;
use App\Services\Biometric\FaceRecognitionService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AttendanceService
{
    public function __construct(
        private SettingService $settingService,
        private WhatsAppService $whatsAppService,
        private ?FaceRecognitionService $faceService = null
    ) {
        if ($this->faceService === null && config('biometric.enabled')) {
            $this->faceService = app(FaceRecognitionService::class);
        }
    }

    /**
     * Register entry attendance by scanning QR code.
     */
    public function scanEntry(string $qrCode, int $userId): array
    {
        return DB::transaction(function () use ($qrCode, $userId) {
            $attendable = $this->findByQRCode($qrCode);

            if (!$attendable) {
                throw new BusinessException('Código QR no válido');
            }

            return $this->registerEntry($attendable, $userId, 'SCANNER');
        });
    }

    /**
     * Register exit attendance by scanning QR code.
     */
    public function scanExit(string $qrCode, int $userId): array
    {
        return DB::transaction(function () use ($qrCode, $userId) {
            $attendable = $this->findByQRCode($qrCode);

            if (!$attendable) {
                throw new BusinessException('Código QR no válido');
            }

            return $this->registerExit($attendable, $userId);
        });
    }

    /**
     * Register entry attendance via biometric face scan.
     */
    public function scanEntryByFace(string $imageBase64, int $tenantId, int $userId, array $filters = []): array
    {
        return DB::transaction(function () use ($imageBase64, $tenantId, $userId) {
            [$attendable, $confidence] = $this->resolveAttendableByFace($imageBase64, $tenantId);

            $result = $this->registerEntry($attendable, $userId, 'BIOMETRIC', $confidence);

            Log::info('Biometric entry registered', [
                'attendable_id' => $attendable->id,
                'confidence' => $confidence,
                'status' => $result['attendance']->entry_status ?? 'unknown',
            ]);

            return $this->formatBiometricResponse($result, $attendable, $confidence, 'entry');
        });
    }

    /**
     * Register exit attendance via biometric face scan.
     */
    public function scanExitByFace(string $imageBase64, int $tenantId, int $userId, array $filters = []): array
    {
        return DB::transaction(function () use ($imageBase64, $tenantId, $userId) {
            [$attendable, $confidence] = $this->resolveAttendableByFace($imageBase64, $tenantId);

            $result = $this->registerExit($attendable, $userId);

            Log::info('Biometric exit registered', [
                'attendable_id' => $attendable->id,
                'confidence' => $confidence,
                'status' => $result['attendance']->exit_status ?? 'unknown',
            ]);

            return $this->formatBiometricResponse($result, $attendable, $confidence, 'exit');
        });
    }

    /**
     * Core entry registration logic.
     */
    private function registerEntry(
        Student|Teacher $attendable,
        int $userId,
        string $deviceType,
        ?float $faceConfidence = null
    ): array {
        $existing = $this->findTodayAttendance($attendable);

        if ($existing?->entry_time) {
            throw new BusinessException(
                "Ya se registró la entrada de {$attendable->full_name} a las {$existing->entry_time->format('H:i')}"
            );
        }

        $now = now();
        ['level' => $level, 'shift' => $shift] = $this->getAttendableInfo($attendable);
        $status = $this->calculateEntryStatus($level, $shift, $now);

        $data = [
            'entry_time' => $now,
            'entry_status' => $status,
            'recorded_by' => $userId,
            'device_type' => $deviceType,
        ];

        if ($faceConfidence !== null) {
            $data['face_match_confidence'] = $faceConfidence;
        }

        if ($existing) {
            $existing->update($data);
            $attendance = $existing;
        } else {
            $attendance = Attendance::create([
                'attendable_type' => get_class($attendable),
                'attendable_id' => $attendable->id,
                'date' => now()->startOfDay(),
                'shift' => $shift,
                'whatsapp_sent' => false,
                ...$data,
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
    }

    /**
     * Core exit registration logic.
     */
    private function registerExit(Student|Teacher $attendable, int $userId): array
    {
        $attendance = $this->findTodayAttendance($attendable);

        if (!$attendance?->entry_time) {
            throw new BusinessException(
                "No se puede registrar salida sin entrada previa para {$attendable->full_name}"
            );
        }

        if ($attendance->exit_time) {
            throw new BusinessException(
                "Ya se registró la salida de {$attendable->full_name} a las {$attendance->exit_time->format('H:i')}"
            );
        }

        $now = now();
        ['level' => $level, 'shift' => $shift] = $this->getAttendableInfo($attendable);
        $status = $this->calculateExitStatus($level, $shift, $now);

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
    }

    /**
     * Resolve attendable entity from face recognition.
     *
     * @return array{0: Student|Teacher, 1: float}
     */
    private function resolveAttendableByFace(string $imageBase64, int $tenantId): array
    {
        $result = $this->faceService->search($tenantId, $imageBase64);

        if (empty($result['matches'])) {
            throw BiometricException::noMatch();
        }

        $match = $result['matches'][0];
        $confidence = $match['confidence'];

        $minThreshold = config('biometric.thresholds.match_low', 60.0);
        if ($confidence < $minThreshold) {
            throw BiometricException::lowConfidence($confidence);
        }

        $parsed = FaceEmbedding::parseExternalId($match['external_id']);
        if (!$parsed) {
            Log::error('Invalid external_id from face service', ['external_id' => $match['external_id']]);
            throw BiometricException::noMatch();
        }

        $attendable = $parsed['type']::find($parsed['id']);
        if (!$attendable) {
            throw BiometricException::noMatch();
        }

        return [$attendable, $confidence];
    }

    /**
     * Get level and shift for an attendable.
     */
    private function getAttendableInfo(Student|Teacher $attendable): array
    {
        return [
            'level' => $attendable instanceof Student ? $attendable->classroom->level : $attendable->level,
            'shift' => $attendable instanceof Student ? $attendable->classroom->shift : 'MAÑANA',
        ];
    }

    /**
     * Find today's attendance for an attendable.
     */
    private function findTodayAttendance(Student|Teacher $attendable): ?Attendance
    {
        return Attendance::where('attendable_type', get_class($attendable))
            ->where('attendable_id', $attendable->id)
            ->where('date', now()->startOfDay())
            ->first();
    }

    /**
     * Calculate entry status based on schedule.
     */
    private function calculateEntryStatus(string $level, string $shift, Carbon $time): string
    {
        $schedule = $this->settingService->getScheduleForLevel($level, $shift);
        $toleranceMinutes = $this->settingService->getToleranceMinutes();
        $entryTimeLimit = Carbon::parse($schedule['entrada'])->addMinutes($toleranceMinutes);

        return $time->format('H:i') <= $entryTimeLimit->format('H:i') ? 'COMPLETO' : 'TARDANZA';
    }

    /**
     * Calculate exit status based on schedule.
     */
    private function calculateExitStatus(string $level, string $shift, Carbon $time): string
    {
        $schedule = $this->settingService->getScheduleForLevel($level, $shift);
        $exitTimeLimit = Carbon::parse($schedule['salida']);

        return $time->format('H:i') >= $exitTimeLimit->format('H:i') ? 'COMPLETO' : 'SALIDA_ANTICIPADA';
    }

    /**
     * Format response for biometric scans.
     */
    private function formatBiometricResponse(array $result, Student|Teacher $attendable, float $confidence, string $type): array
    {
        $attendance = $result['attendance'];
        $now = now();

        return [
            'success' => true,
            'message' => $result['message'],
            'attendance' => [
                'id' => $attendance->id,
                'status' => $type === 'entry' ? $attendance->entry_status : $attendance->exit_status,
                "{$type}_time" => $now->format('H:i:s'),
            ],
            'person' => [
                'id' => $attendable->id,
                'type' => $attendable instanceof Student ? 'student' : 'teacher',
                'full_name' => $attendable->full_name,
                'classroom' => $attendable instanceof Student ? $attendable->classroom?->full_name : null,
            ],
            'match' => [
                'confidence' => $confidence,
            ],
        ];
    }

    /**
     * Find student or teacher by QR code.
     */
    private function findByQRCode(string $qrCode): Student|Teacher|null
    {
        return Student::where('qr_code', $qrCode)->first()
            ?? Teacher::where('qr_code', $qrCode)->first();
    }

    /**
     * Build entry message for attendance response.
     */
    private function getEntryMessage(Student|Teacher $attendable, string $status, Carbon $time): string
    {
        $name = $attendable->full_name;
        $hora = $time->format('h:i A');
        $type = $attendable instanceof Student ? 'Estudiante' : 'Docente';

        return match ($status) {
            'COMPLETO' => "{$type}: {$name} - Entrada registrada a las {$hora}",
            'TARDANZA' => "{$type}: {$name} - Tardanza registrada a las {$hora}",
            default => "{$type}: {$name} - Entrada registrada"
        };
    }

    /**
     * Build exit message for attendance response.
     */
    private function getExitMessage(Student|Teacher $attendable, string $status, Carbon $time): string
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

    /**
     * Get daily attendance statistics for students and teachers.
     */
    public function getDailyStats(?Carbon $date = null): array
    {
        $date = $date ?? now();

        $students = Attendance::students()->forDate($date)->get();
        $teachers = Attendance::teachers()->forDate($date)->get();

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
            'notifications_sent' => Attendance::forDate($date)->where('whatsapp_sent', true)->count(),
        ];
    }

    /**
     * Apply justifications to attendance records for a specific date.
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

            if (!$attendance) {
                continue;
            }

            match ($justification->type) {
                'FALTA' => $attendance->update(['entry_status' => 'FALTA_JUSTIFICADA']),
                'SALIDA_ANTICIPADA' => $attendance->update(['exit_status' => 'SALIDA_ANTICIPADA_JUSTIFICADA']),
                default => null,
            };
        }
    }

    /**
     * Generate absence records for students and teachers who didn't attend.
     */
    public function generateAbsences(Carbon $date): void
    {
        if (!$this->settingService->isAttendanceDay(strtolower($date->locale('es')->dayName))) {
            return;
        }

        $this->generateStudentAbsences($date);
        $this->generateTeacherAbsences($date);
        $this->applyJustifications($date);
    }

    private function generateStudentAbsences(Carbon $date): void
    {
        $presentIds = Attendance::students()->forDate($date)->pluck('attendable_id');

        Student::whereNotIn('id', $presentIds)->each(function (Student $student) use ($date) {
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
        });
    }

    private function generateTeacherAbsences(Carbon $date): void
    {
        $presentIds = Attendance::teachers()->forDate($date)->pluck('attendable_id');

        Teacher::whereNotIn('id', $presentIds)->each(function (Teacher $teacher) use ($date) {
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
        });
    }
}
