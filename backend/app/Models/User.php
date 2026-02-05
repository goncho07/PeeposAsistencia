<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Traits\BelongsToTenant;
use App\Traits\HasActiveStatus;
use App\Traits\HasFullName;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasFullName, HasActiveStatus, Notifiable, BelongsToTenant, SoftDeletes;

    public const ROLE_SUPERADMIN = 'SUPERADMIN';
    public const ROLE_DIRECTOR = 'DIRECTOR';
    public const ROLE_TEACHER = 'DOCENTE';

    protected $fillable = [
        'tenant_id',
        'document_type',
        'document_number',
        'name',
        'paternal_surname',
        'maternal_surname',
        'photo_url',
        'email',
        'password',
        'role',
        'phone_number',
        'status',
        'last_login_at',
        'last_login_ip',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'last_login_at' => 'datetime',
    ];

    protected $appends = [
        'full_name',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function teacher()
    {
        return $this->hasOne(Teacher::class);
    }

    public function attendances()
    {
        return $this->morphMany(Attendance::class, 'attendable');
    }

    public function justifications()
    {
        return $this->morphMany(Justification::class, 'justifiable');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function createdJustifications()
    {
        return $this->hasMany(Justification::class, 'created_by');
    }

    public function recordedAttendances()
    {
        return $this->hasMany(Attendance::class, 'recorded_by');
    }

    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class);
    }

    public function reportedIncidents()
    {
        return $this->hasMany(Incident::class, 'reported_by');
    }

    public function resolvedIncidents()
    {
        return $this->hasMany(Incident::class, 'resolved_by');
    }

    public function scopeByRole($query, $role)
    {
        return $query->where('role', $role);
    }

    public function isSuperAdmin()
    {
        return $this->role === 'SUPERADMIN';
    }

    public function isTeacher()
    {
        return $this->role === 'DOCENTE';
    }

    public function hasTeacherProfile()
    {
        return $this->teacher()->exists();
    }

    public function updateLastLogin($ipAddress = null)
    {
        $this->update([
            'last_login_at' => now(),
            'last_login_ip' => $ipAddress ?? client_ip(),
        ]);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('document_number', 'like', "%{$search}%")
                ->orWhere('name', 'like', "%{$search}%")
                ->orWhere('paternal_surname', 'like', "%{$search}%")
                ->orWhere('maternal_surname', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%");
        });
    }
}
