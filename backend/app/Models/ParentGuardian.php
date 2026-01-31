<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ParentGuardian extends Model
{
    use HasFactory, BelongsToTenant;

    protected $table = 'parents';

    protected $fillable = [
        'tenant_id',
        'document_type',
        'document_number',
        'name',
        'paternal_surname',
        'maternal_surname',
        'photo_url',
        'phone_number',
        'phone_number_secondary',
        'email',
        'address',
        'workplace',
    ];

    protected $appends = [
        'full_name',
    ];

    public function students()
    {
        return $this->belongsToMany(
            Student::class,
            'student_parent',
            'parent_id',
            'student_id'
        )->withPivot([
            'tenant_id',
            'relationship_type',
            'custom_relationship_label',
            'is_primary_contact',
            'receives_notifications'
        ])->withTimestamps();
    }

    public function getFullNameAttribute()
    {
        return "{$this->name} {$this->paternal_surname} {$this->maternal_surname}";
    }

    public function getPrimaryPhoneAttribute()
    {
        return $this->phone_number ?? $this->phone_number_secondary;
    }

    public function scopeReceivesNotifications($query)
    {
        return $query->whereHas('students', function ($q) {
            $q->wherePivot('receives_notifications', true);
        });
    }
}
