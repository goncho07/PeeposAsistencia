<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Justificacion extends Model
{
    use HasFactory;

    protected $table = 'justificaciones';

    protected $fillable = [
        'justifiable_type',
        'justifiable_id',
        'date_from',
        'date_to',
        'type',
        'reason',
        'document_path',
        'created_by',
        'status',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'date_from' => 'date',
        'date_to' => 'date',
        'reviewed_at' => 'datetime',
    ];

    public function justifiable()
    {
        return $this->morphTo();
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'PENDIENTE');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'APROBADA');
    }

    public function approve(User $user)
    {
        $this->update([
            'status' => 'APROBADA',
            'reviewed_by' => $user->id,
            'reviewed_at' => now(),
        ]);
    }

    public function reject(User $user)
    {
        $this->update([
            'status' => 'RECHAZADA',
            'reviewed_by' => $user->id,
            'reviewed_at' => now(),
        ]);
    }
}
