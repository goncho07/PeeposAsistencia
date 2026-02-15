<?php

namespace App\Services;

use App\Exceptions\BiometricException;
use App\Models\Attendance;
use App\Models\FaceEmbedding;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use App\Models\Justification;
use App\Exceptions\BusinessException;
use App\Http\Resources\AttendanceResource;
use App\Services\Biometric\FaceRecognitionService;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AttendanceService
{
    public function __construct(
        private SettingService $settingService,
        private WhatsAppService $whatsAppService,
        private AcademicYearService $academicYearService,
        private ?FaceRecognitionService $faceService = null
    ) {
        if ($this->faceService === null && config('biometric.enabled')) {
            $this->faceService = app(FaceRecognitionService::class);
        }
    }

    /**
     * Register entry attendance by scanning QR code.
     */
    public function scanEntry(string $qrCode, string $deviceType = 'SCANNER'): array
    {
        return DB::transaction(function () use ($qrCode, $deviceType) {
            $attendable = $this->findByQRCode($qrCode);

            if (!$attendable) {
                throw new BusinessException('Código QR no válido');
            }

            return $this->registerEntry($attendable, $deviceType);
        });
    }

    /**
     * Register exit attendance by scanning QR code.
     */
    public function scanExit(string $qrCode, string $deviceType = 'SCANNER'): array
    {
        return DB::transaction(function () use ($qrCode, $deviceType) {
            $attendable = $this->findByQRCode($qrCode);

            if (!$attendable) {
                throw new BusinessException('Código QR no válido');
            }

            return $this->registerExit($attendable, $deviceType);
        });
    }

    /**
     * Register entry attendance via biometric face scan.
     */
    public function scanEntryByFace(string $imageBase64, int $tenantId, array $filters = []): array
    {
        return DB::transaction(function () use ($imageBase64, $tenantId) {
            [$attendable, $confidence] = $this->resolveAttendableByFace($imageBase64, $tenantId);

            $result = $this->registerEntry($attendable, 'BIOMETRIA', $confidence);

            Log::info('Biometric entry registered', [
                'attendable_id' => $attendable->id,
                'confidence' => $confidence,
                'status' => $result['attendance']['entry_status'] ?? 'unknown',
            ]);

            return $this->formatBiometricResponse($result, $attendable, $confidence, 'entry');
        });
    }

    /**
     * Register exit attendance via biometric face scan.
     */
    public function scanExitByFace(string $imageBase64, int $tenantId, array $filters = []): array
    {
        return DB::transaction(function () use ($imageBase64, $tenantId) {
            [$attendable, $confidence] = $this->resolveAttendableByFace($imageBase64, $tenantId);

            $result = $this->registerExit($attendable, 'BIOMETRIA');

            Log::info('Biometric exit registered', [
                'attendable_id' => $attendable->id,
                'confidence' => $confidence,
                'status' => $result['attendance']['exit_status'] ?? 'unknown',
            ]);

            return $this->formatBiometricResponse($result, $attendable, $confidence, 'exit');
        });
    }

    /**
     * Core entry registration logic.
     */
    private function registerEntry(
        Student|Teacher|User $attendable,
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
            'attendance' => [
                'id' => $attendance->id,
                'entry_time' => $now->format('H:i:s'),
                'entry_status' => $status,
            ],
            'person' => [
                'id' => $attendable->id,
                'full_name' => $attendable->full_name,
                'type' => $this->getAttendableTypeName($attendable),
            ],
        ];
    }

    /**
     * Core exit registration logic.
     */
    private function registerExit(Student|Teacher|User $attendable, string $deviceType): array
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
            'device_type' => $deviceType,
        ]);

        if ($attendable instanceof Student) {
            $this->whatsAppService->sendAttendanceNotification($attendable, $attendance, 'SALIDA');
        }

        return [
            'success' => true,
            'message' => $this->getExitMessage($attendable, $status, $now),
            'attendance' => [
                'id' => $attendance->id,
                'exit_time' => $now->format('H:i:s'),
                'exit_status' => $status,
            ],
            'person' => [
                'id' => $attendable->id,
                'full_name' => $attendable->full_name,
                'type' => $this->getAttendableTypeName($attendable),
            ],
        ];
    }

    /**
     * Resolve attendable entity from face recognition.
     *
     * @return array{0: Student|Teacher|User, 1: float}
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
    private function getAttendableInfo(Student|Teacher|User $attendable): array
    {
        if ($attendable instanceof Student) {
            return [
                'level' => $attendable->classroom->level,
                'shift' => $attendable->classroom->shift,
            ];
        }

        if ($attendable instanceof Teacher) {
            return [
                'level' => $attendable->level,
                'shift' => 'MAÑANA',
            ];
        }

        // User (COORDINADOR, AUXILIAR, etc.) — use SECUNDARIA as default level
        return [
            'level' => 'SECUNDARIA',
            'shift' => 'MAÑANA',
        ];
    }

    /**
     * Find today's attendance for an attendable.
     */
    private function findTodayAttendance(Student|Teacher|User $attendable): ?Attendance
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
    private function formatBiometricResponse(array $result, Student|Teacher|User $attendable, float $confidence, string $type): array
    {
        $attendance = $result['attendance'];

        return [
            'success' => true,
            'message' => $result['message'],
            'attendance' => [
                'id' => $attendance['id'],
                'status' => $type === 'entry'
                    ? ($attendance['entry_status'] ?? null)
                    : ($attendance['exit_status'] ?? null),
                "{$type}_time" => $type === 'entry'
                    ? ($attendance['entry_time'] ?? null)
                    : ($attendance['exit_time'] ?? null),
            ],
            'person' => [
                'id' => $attendable->id,
                'type' => $this->getAttendableTypeName($attendable),
                'full_name' => $attendable->full_name,
                'classroom' => $attendable instanceof Student ? $attendable->classroom?->full_name : null,
            ],
            'match' => [
                'confidence' => $confidence,
            ],
        ];
    }

    /**
     * Find attendable entity by QR code, respecting tenant's allowed attendable types.
     */
    private function findByQRCode(string $qrCode): Student|Teacher|User|null
    {
        $allowedTypes = $this->settingService->getAttendableTypes();

        if (in_array('student', $allowedTypes)) {
            $student = Student::where('qr_code', $qrCode)->first();
            if ($student) return $student;
        }

        if (in_array('teacher', $allowedTypes)) {
            $teacher = Teacher::where('qr_code', $qrCode)->first();
            if ($teacher) return $teacher;
        }

        if (in_array('user', $allowedTypes)) {
            $user = User::where('qr_code', $qrCode)->where('role', '!=', 'SUPERADMIN')->first();
            if ($user) return $user;
        }

        return null;
    }

    /**
     * Build entry message for attendance response.
     */
    private function getAttendableTypeName(Student|Teacher|User $attendable): string
    {
        if ($attendable instanceof Student) return 'student';
        if ($attendable instanceof Teacher) return 'teacher';
        return 'user';
    }

    private function getAttendableLabel(Student|Teacher|User $attendable): string
    {
        if ($attendable instanceof Student) return 'Estudiante';
        if ($attendable instanceof Teacher) return 'Docente';
        return $attendable->role ?? 'Usuario';
    }

    private function getEntryMessage(Student|Teacher|User $attendable, string $status, Carbon $time): string
    {
        $name = $attendable->full_name;
        $hora = $time->format('h:i A');
        $type = $this->getAttendableLabel($attendable);

        return match ($status) {
            'COMPLETO' => "{$type}: {$name} - Entrada registrada a las {$hora}",
            'TARDANZA' => "{$type}: {$name} - Tardanza registrada a las {$hora}",
            default => "{$type}: {$name} - Entrada registrada"
        };
    }

    private function getExitMessage(Student|Teacher|User $attendable, string $status, Carbon $time): string
    {
        $name = $attendable->full_name;
        $hora = $time->format('h:i A');
        $type = $this->getAttendableLabel($attendable);

        return match ($status) {
            'COMPLETO' => "{$type}: {$name} - Salida registrada a las {$hora}",
            'SALIDA_ANTICIPADA' => "{$type}: {$name} - Salida anticipada a las {$hora}",
            default => "{$type}: {$name} - Salida registrada"
        };
    }

    /**
     * Get paginated attendance records, filtered by allowed attendable types.
     */
    public function getAllAttendances(
        ?string $date = null,
        ?string $type = null,
        ?string $shift = null,
        ?string $status = null,
        ?int $perPage = null
    ): LengthAwarePaginator {
        $allowedTypes = $this->settingService->getAttendableTypes();

        $query = Attendance::with([
            'attendable' => function ($morphTo) {
                $morphTo->morphWith([
                    Student::class => ['classroom'],
                    Teacher::class => ['classrooms'],
                ]);
            }
        ]);

        if ($date) {
            $query->forDate(Carbon::parse($date));
        }

        if ($type) {
            if (!in_array($type, $allowedTypes)) {
                throw new BusinessException('El tipo de asistencia seleccionado no está habilitado.');
            }

            match ($type) {
                'student' => $query->students(),
                'teacher' => $query->teachers(),
                'user' => $query->users(),
                default => null,
            };
        } else {
            $modelClasses = $this->settingService->getAttendableModelClasses();
            $morphClasses = array_map(
                fn ($class) => (new $class)->getMorphClass(),
                $modelClasses
            );
            $query->whereIn('attendable_type', $morphClasses);
        }

        if ($shift) {
            $query->byShift($shift);
        }

        if ($status) {
            $query->byStatus($status);
        }

        return $query->latest('date')->latest('entry_time')->paginate($perPage ?? 20);
    }

    /**
     * Get personal attendance data for the authenticated user.
     */
    public function getMyAttendance(User $user): array
    {
        $allowedTypes = $this->settingService->getAttendableTypes();
        $attendable = null;
        $attendableType = null;

        if (in_array('teacher', $allowedTypes) && $user->hasTeacherProfile()) {
            $attendable = $user->teacher;
            $attendableType = Teacher::class;
        } elseif (in_array('user', $allowedTypes)) {
            $attendable = $user;
            $attendableType = User::class;
        }

        if (!$attendable) {
            return ['eligible' => false];
        }

        $today = now();
        $weekStart = $today->copy()->startOfWeek(Carbon::MONDAY);
        $weekEnd = $weekStart->copy()->addDays(4);
        $monthStart = $today->copy()->startOfMonth();
        $monthEnd = $today->copy()->endOfMonth();
        $bimester = $this->academicYearService->getCurrentBimester($today);

        $todayRecord = Attendance::where('attendable_type', $attendableType)
            ->where('attendable_id', $attendable->id)
            ->forDate($today)
            ->first();

        $todayStatus = $todayRecord ? [
            'entry_status' => $todayRecord->entry_status,
            'entry_time' => $todayRecord->entry_time?->format('H:i:s'),
            'exit_status' => $todayRecord->exit_status,
            'exit_time' => $todayRecord->exit_time?->format('H:i:s'),
        ] : null;

        $history = Attendance::where('attendable_type', $attendableType)
            ->where('attendable_id', $attendable->id)
            ->latest('date')
            ->paginate(20);

        return [
            'eligible' => true,
            'attendable_type' => $this->getAttendableTypeName($attendable),
            'attendable_name' => $attendable->full_name,
            'today' => $todayStatus,
            'stats' => [
                'week' => $this->getAttendanceBreakdown($attendableType, $attendable->id, $weekStart, $weekEnd),
                'month' => $this->getAttendanceBreakdown($attendableType, $attendable->id, $monthStart, $monthEnd),
                'bimester' => $bimester
                    ? $this->getAttendanceBreakdown($attendableType, $attendable->id, $bimester->start_date, $bimester->end_date)
                    : null,
            ],
            'bimester_info' => $bimester ? [
                'number' => $bimester->number,
                'start_date' => $bimester->start_date->format('Y-m-d'),
                'end_date' => $bimester->end_date->format('Y-m-d'),
            ] : null,
            'history' => AttendanceResource::collection($history)->response()->getData(true),
        ];
    }

    /**
     * Get attendance breakdown counts for a date range.
     */
    private function getAttendanceBreakdown(string $attendableType, int $attendableId, Carbon $from, Carbon $to): array
    {
        $records = Attendance::where('attendable_type', $attendableType)
            ->where('attendable_id', $attendableId)
            ->whereBetween('date', [$from, $to])
            ->get();

        return [
            'total' => $records->count(),
            'present' => $records->where('entry_status', 'COMPLETO')->count(),
            'late' => $records->where('entry_status', 'TARDANZA')->count(),
            'absent' => $records->whereIn('entry_status', ['FALTA', 'FALTA_JUSTIFICADA'])->count(),
            'justified' => $records->where('entry_status', 'FALTA_JUSTIFICADA')->count(),
        ];
    }

    /**
     * Get daily attendance statistics, scoped to tenant's allowed attendable types.
     */
    public function getDailyStats(?Carbon $date = null): array
    {
        $date = $date ?? now();
        $allowedTypes = $this->settingService->getAttendableTypes();

        $result = [
            'date' => $date->format('Y-m-d'),
            'allowed_types' => $allowedTypes,
        ];

        if (in_array('student', $allowedTypes)) {
            $students = Attendance::students()->forDate($date)->get();
            $result['students'] = [
                'total_registered' => Student::count(),
                'present' => $students->where('entry_status', 'COMPLETO')->count(),
                'late' => $students->where('entry_status', 'TARDANZA')->count(),
                'absent' => $students->where('entry_status', 'FALTA')->count(),
                'justified' => $students->where('entry_status', 'FALTA_JUSTIFICADA')->count(),
            ];
        }

        if (in_array('teacher', $allowedTypes)) {
            $teachers = Attendance::teachers()->forDate($date)->get();
            $result['teachers'] = [
                'total_registered' => Teacher::count(),
                'present' => $teachers->where('entry_status', 'COMPLETO')->count(),
                'late' => $teachers->where('entry_status', 'TARDANZA')->count(),
                'absent' => $teachers->where('entry_status', 'FALTA')->count(),
            ];
        }

        if (in_array('user', $allowedTypes)) {
            $users = Attendance::users()->forDate($date)->get();
            $result['users'] = [
                'total_registered' => User::whereNotNull('qr_code')->where('status', 'ACTIVO')->where('role', '!=', 'SUPERADMIN')->count(),
                'present' => $users->where('entry_status', 'COMPLETO')->count(),
                'late' => $users->where('entry_status', 'TARDANZA')->count(),
                'absent' => $users->where('entry_status', 'FALTA')->count(),
            ];
        }

        return $result;
    }

    /**
     * Get weekly attendance statistics (Mon-Fri), aggregated across allowed attendable types.
     */
    public function getWeeklyStats(?Carbon $date = null): array
    {
        $date = $date ?? now();
        $weekStart = $date->copy()->startOfWeek(Carbon::MONDAY);
        $weekEnd = $weekStart->copy()->addDays(4);
        $allowedTypes = $this->settingService->getAttendableTypes();

        $days = [];
        for ($day = $weekStart->copy(); $day->lte($weekEnd); $day->addDay()) {
            $dayStats = $this->getDailyStats($day);

            $present = 0;
            $late = 0;
            $absent = 0;
            $justified = 0;

            foreach ($allowedTypes as $type) {
                $typeKey = match ($type) {
                    'student' => 'students',
                    'teacher' => 'teachers',
                    'user' => 'users',
                    default => null,
                };
                if ($typeKey && isset($dayStats[$typeKey])) {
                    $present += $dayStats[$typeKey]['present'];
                    $late += $dayStats[$typeKey]['late'];
                    $absent += $dayStats[$typeKey]['absent'];
                    $justified += $dayStats[$typeKey]['justified'] ?? 0;
                }
            }

            $days[] = [
                'date' => $day->format('Y-m-d'),
                'day_name' => ucfirst($day->locale('es')->dayName),
                'present' => $present,
                'late' => $late,
                'absent' => $absent,
                'justified' => $justified,
            ];
        }

        return [
            'week_start' => $weekStart->format('Y-m-d'),
            'week_end' => $weekEnd->format('Y-m-d'),
            'allowed_types' => $allowedTypes,
            'days' => $days,
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
     * Generate absence records for attendable types allowed by tenant config.
     */
    public function generateAbsences(Carbon $date): void
    {
        if (!$this->settingService->isAttendanceDay(strtolower($date->locale('es')->dayName))) {
            return;
        }

        $allowedTypes = $this->settingService->getAttendableTypes();

        if (in_array('student', $allowedTypes)) {
            $this->generateStudentAbsences($date);
        }

        if (in_array('teacher', $allowedTypes)) {
            $this->generateTeacherAbsences($date);
        }

        if (in_array('user', $allowedTypes)) {
            $this->generateUserAbsences($date);
        }

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

    private function generateUserAbsences(Carbon $date): void
    {
        $presentIds = Attendance::users()->forDate($date)->pluck('attendable_id');

        User::whereNotNull('qr_code')
            ->where('status', 'ACTIVO')
            ->where('role', '!=', 'SUPERADMIN')
            ->whereNotIn('id', $presentIds)
            ->each(function (User $user) use ($date) {
                Attendance::create([
                    'attendable_type' => User::class,
                    'attendable_id' => $user->id,
                    'date' => $date,
                    'shift' => 'MAÑANA',
                    'entry_status' => 'FALTA',
                    'exit_status' => 'SIN_SALIDA',
                    'device_type' => 'IMPORTACION',
                    'whatsapp_sent' => false,
                ]);
            });
    }

    /**
     * Get attendance stats for all students in a classroom.
     */
    public function getClassroomAttendanceStats(int $classroomId, ?Carbon $from = null, ?Carbon $to = null): array
    {
        $classroom = \App\Models\Classroom::findOrFail($classroomId);

        $from = $from ?? now()->startOfMonth();
        $to = $to ?? now();

        $studentIds = $classroom->students()->pluck('id');

        $records = Attendance::where('attendable_type', Student::class)
            ->whereIn('attendable_id', $studentIds)
            ->whereBetween('date', [$from, $to])
            ->get();

        return [
            'classroom_id' => $classroomId,
            'classroom_name' => $classroom->full_name,
            'period_label' => $from->format('d/m') . ' - ' . $to->format('d/m/Y'),
            'total_students' => $studentIds->count(),
            'total' => $records->count(),
            'present' => $records->where('entry_status', 'COMPLETO')->count(),
            'late' => $records->where('entry_status', 'TARDANZA')->count(),
            'absent' => $records->whereIn('entry_status', ['FALTA', 'FALTA_JUSTIFICADA'])->count(),
            'justified' => $records->where('entry_status', 'FALTA_JUSTIFICADA')->count(),
        ];
    }
}
