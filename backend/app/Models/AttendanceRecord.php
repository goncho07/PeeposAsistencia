<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AttendanceRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'section_id',
        'date',
        'check_in',
        'check_out',
        'status',
        'remarks',
        'recorded_by_type',
        'recorded_by_id'
    ];

    protected $casts = [
        'date' => 'date',
        // check_in y check_out a veces conviene tratarlos como strings 'H:i' o Carbon instances
        // Si usamos 'datetime:H:i', Laravel formateará automáticamente.
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function section()
    {
        return $this->belongsTo(Section::class); // Necesitaremos crear este modelo también aunque no lo pediste explícitamente en la lista de modelos, es buena práctica.
    }
}
