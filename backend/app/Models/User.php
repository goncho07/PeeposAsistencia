<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'paternal_surname',
        'maternal_surname',
        'email',
        'password',
        'rol',
        'dni',
        'avatar_url',
        'phone_number',
        'status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function getFullNameAttribute(): string
    {
        return "{$this->name} {$this->paternal_surname} {$this->maternal_surname}";
    }

    public function isDirector(): bool
    {
        return $this->rol === 'DIRECTOR';
    }

    public function isActivo(): bool
    {
        return $this->status === 'ACTIVO';
    }
}
