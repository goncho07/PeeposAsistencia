<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Padre extends Model
{
    use HasFactory;

    protected $table = 'padres_apoderados';

    protected $fillable = [
        'document_type',
        'document_number',
        'name',
        'paternal_surname',
        'maternal_surname',
        'phone_number',
        'email',
        'relationship_type',
    ];

    public function getFullNameAttribute(): string
    {
        return "{$this->name} {$this->paternal_surname} {$this->maternal_surname}";
    }

    public function estudiantes()
    {
        return $this->hasMany(Estudiante::class, 'padre_id');
    }
}
