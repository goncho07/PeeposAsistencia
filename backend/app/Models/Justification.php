<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Justification extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'justifiable_type',
        'justifiable_id',
        'date_from',
        'date_to',
        'type',
        'reason',
        'document_path',
        'created_by',
    ];

    protected $casts = [
        'date_from' => 'date',
        'date_to' => 'date',
    ];

    public function justifiable()
    {
        return $this->morphTo();
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeForDateRange($query, $startDate, $endDate)
    {
        return $query->where(function ($q) use ($startDate, $endDate) {
            $q->whereBetween('date_from', [$startDate, $endDate])
                ->orWhereBetween('date_to', [$startDate, $endDate])
                ->orWhere(function ($q2) use ($startDate, $endDate) {
                    $q2->where('date_from', '<=', $startDate)
                        ->where('date_to', '>=', $endDate);
                });
        });
    }
    
    public function getDaysCount()
    {
        return $this->date_from->diffInDays($this->date_to) + 1;
    }
}
