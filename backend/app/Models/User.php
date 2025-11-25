<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // Importante para la API
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'lastname',
        'email',
        'password',
        'dni',
        'phone',
        'address',
        'avatar',
        'role', // admin, teacher, student, parent
        'is_active',
        'section_id',
        'parent_id'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    // --- Relaciones ---

    // Un estudiante pertenece a una sección
    public function section()
    {
        return $this->belongsTo(Section::class); // Asumimos que Section model existirá (lo crearé abajo brevemente o se asume implícito)
    }

    // Un estudiante tiene asistencias
    public function attendanceRecords()
    {
        return $this->hasMany(AttendanceRecord::class);
    }

    // Un apoderado tiene varios estudiantes (hijos)
    public function children()
    {
        return $this->hasMany(User::class, 'parent_id');
    }

    // Un estudiante tiene un apoderado
    public function parent()
    {
        return $this->belongsTo(User::class, 'parent_id');
    }
}
