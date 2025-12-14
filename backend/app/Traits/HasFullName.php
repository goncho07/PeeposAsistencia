<?php

namespace App\Traits;

trait HasFullName
{
    public function getFullNameAttribute(): string
    {
        return trim("{$this->name} {$this->paternal_surname} {$this->maternal_surname}");
    }
}
