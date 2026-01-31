<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tenant extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'modular_code',
        'slug',
        'ruc',
        'name',
        'director_name',
        'founded_year',
        'institution_type',
        'level',
        'email',
        'phone',
        'address',
        'department',
        'province',
        'district',
        'ugel',
        'ubigeo',
        'logo_url',
        'banner_url',
        'background_url',
        'primary_color',
        'timezone',
        'is_active',
        'last_activity_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'last_activity_at' => 'datetime',
        'founded_year' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($tenant) {
            if (empty($tenant->slug)) {
                $tenant->slug = \Illuminate\Support\Str::slug($tenant->name);
            }
        });
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function students()
    {
        return $this->hasMany(Student::class);
    }

    public function teachers()
    {
        return $this->hasMany(Teacher::class);
    }

    public function classrooms()
    {
        return $this->hasMany(Classroom::class);
    }

    public function parents()
    {
        return $this->hasMany(ParentGuardian::class);
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    public function settings()
    {
        return $this->hasMany(Setting::class);
    }

    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function getSetting($key, $default = null)
    {
        $setting = $this->settings()->where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    public function setSetting($key, $value, $type = 'string', $group = 'general')
    {
        return $this->settings()->updateOrCreate(
            ['key' => $key],
            ['value' => $value, 'type' => $type, 'group' => $group]
        );
    }

    public function updateActivity()
    {
        if (!$this->last_activity_at || $this->last_activity_at->diffInMinutes(now()) >= 5) {
            $this->update(['last_activity_at' => now()]);
        }
    }
}
