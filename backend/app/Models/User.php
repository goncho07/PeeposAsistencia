<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Traits\BelongsToTenant;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'name',
        'paternal_surname',
        'maternal_surname',
        'dni',
        'email',
        'password',
        'role',
        'phone_number',
        'photo_url',
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

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function createdJustifications()
    {
        return $this->hasMany(Justification::class, 'created_by');
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

    public function getFullNameAttribute()
    {
        return "{$this->name} {$this->paternal_surname} {$this->maternal_surname}";
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'ACTIVO');
    }

    public function scopeByRole($query, $role)
    {
        return $query->where('role', $role);
    }

    public function isSuperAdmin()
    {
        return $this->role === 'SUPERADMIN';
    }

    public function updateLastLogin($ipAddress = null)
    {
        $this->update([
            'last_login_at' => now(),
            'last_login_ip' => $ipAddress ?? client_ip(),
        ]);
    }
}
