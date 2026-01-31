<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class CalendarEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'title',
        'description',
        'type',
        'event_date',
        'end_date',
        'is_recurring',
        'is_non_working_day',
        'color',
    ];

    protected $casts = [
        'event_date' => 'date',
        'end_date' => 'date',
        'is_recurring' => 'boolean',
        'is_non_working_day' => 'boolean',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function scopeGlobal(Builder $query): Builder
    {
        return $query->whereNull('tenant_id');
    }

    public function scopeForTenant(Builder $query, int $tenantId): Builder
    {
        return $query->where(function ($q) use ($tenantId) {
            $q->whereNull('tenant_id')
              ->orWhere('tenant_id', $tenantId);
        });
    }

    public function getEventDateForYear(int $year): string
    {
        if ($this->is_recurring) {
            return $year . $this->event_date->format('-m-d');
        }

        return $this->event_date->format('Y-m-d');
    }
}
