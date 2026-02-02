<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Teacher extends Model
{
    use HasFactory, BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'user_id',
        'qr_code',
        'level',
        'specialty',
        'contract_type',
        'hire_date',
        'status',
    ];

    protected $casts = [
        'hire_date' => 'date',
    ];

    protected $appends = [
        'full_name',
    ];


    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tutoredClassrooms()
    {
        return $this->hasMany(Classroom::class, 'tutor_id');
    }

    public function classrooms()
    {
        return $this->belongsToMany(
            Classroom::class, 
            'classroom_teacher'
        )->withPivot([
            'subject', 
            'academic_year', 
            'schedule'
        ])->withTimestamps();
    }

    public function attendances()
    {
        return $this->morphMany(Attendance::class, 'attendable');
    }

    public function justifications()
    {
        return $this->morphMany(Justification::class, 'justifiable');
    }

    public function faceEmbedding()
    {
        return $this->morphOne(FaceEmbedding::class, 'embeddable');
    }

    public function hasFaceEnrolled(): bool
    {
        return $this->faceEmbedding()->where('status', FaceEmbedding::STATUS_ACTIVE)->exists();
    }

    public function getFullNameAttribute()
    {
        return $this->user?->full_name ?? '';
    }

    public function getNameAttribute()
    {
        return $this->user?->name;
    }

    public function getPaternalSurnameAttribute()
    {
        return $this->user?->paternal_surname;
    }

    public function getMaternalSurnameAttribute()
    {
        return $this->user?->maternal_surname;
    }

    public function getDocumentTypeAttribute()
    {
        return $this->user?->document_type;
    }

    public function getDocumentNumberAttribute()
    {
        return $this->user?->document_number;
    }

    public function getEmailAttribute()
    {
        return $this->user?->email;
    }

    public function getPhoneNumberAttribute()
    {
        return $this->user?->phone_number;
    }

    public function getPhotoUrlAttribute()
    {
        return $this->user?->photo_url;
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'ACTIVO');
    }

    public function scopeByLevel($query, $level)
    {
        return $query->where('level', $level);
    }

    public function scopeByContractType($query, $contractType)
    {
        return $query->where('contract_type', $contractType);
    }

    public function scopeSearch($query, $search)
    {
        return $query->whereHas('user', function ($q) use ($search) {
            $q->where('document_number', 'like', "%{$search}%")
                ->orWhere('name', 'like', "%{$search}%")
                ->orWhere('paternal_surname', 'like', "%{$search}%")
                ->orWhere('maternal_surname', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%");
        });
    }

    /**
     * Get the teacher's complete weekly schedule.
     *
     * Combines schedules from all classroom assignments into a single
     * weekly view with classroom and subject information.
     *
     * Schedule JSON structure per classroom_teacher:
     * {
     *   "LUNES": [{"start": "08:00", "end": "09:30"}, ...],
     *   "MARTES": [...],
     *   ...
     * }
     *
     * @param int|null $academicYear Filter by academic year (defaults to current year)
     * @return array Weekly schedule grouped by day
     */
    public function getWeeklySchedule(?int $academicYear = null): array
    {
        $academicYear = $academicYear ?? now()->year;

        $days = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
        $weeklySchedule = array_fill_keys($days, []);

        $assignments = $this->classrooms()
            ->where('classroom_teacher.academic_year', $academicYear)
            ->get();

        foreach ($assignments as $classroom) {
            $schedule = $classroom->pivot->schedule;

            if (!$schedule) {
                continue;
            }

            if (is_string($schedule)) {
                $schedule = json_decode($schedule, true);
            }

            if (!is_array($schedule)) {
                continue;
            }

            foreach ($schedule as $day => $blocks) {
                if (!isset($weeklySchedule[$day])) {
                    continue;
                }

                foreach ($blocks as $block) {
                    $weeklySchedule[$day][] = [
                        'start' => $block['start'],
                        'end' => $block['end'],
                        'subject' => $classroom->pivot->subject,
                        'classroom_id' => $classroom->id,
                        'classroom_name' => $classroom->full_name,
                        'level' => $classroom->level,
                    ];
                }
            }
        }
        
        foreach ($weeklySchedule as $day => &$blocks) {
            usort($blocks, fn($a, $b) => strcmp($a['start'], $b['start']));
        }

        return $weeklySchedule;
    }

    /**
     * Get schedule for a specific day.
     *
     * @param string $day Day name (LUNES, MARTES, etc.)
     * @param int|null $academicYear
     * @return array
     */
    public function getScheduleForDay(string $day, ?int $academicYear = null): array
    {
        $schedule = $this->getWeeklySchedule($academicYear);
        return $schedule[strtoupper($day)] ?? [];
    }

    /**
     * Check if teacher has classes on a specific day and time.
     *
     * @param string $day
     * @param string $time Format: "HH:MM"
     * @param int|null $academicYear
     * @return array|null The class block if found, null otherwise
     */
    public function getClassAt(string $day, string $time, ?int $academicYear = null): ?array
    {
        $daySchedule = $this->getScheduleForDay($day, $academicYear);

        foreach ($daySchedule as $block) {
            if ($time >= $block['start'] && $time < $block['end']) {
                return $block;
            }
        }

        return null;
    }
}
