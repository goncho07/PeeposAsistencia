<?php

namespace App\Traits;

/**
 * Trait for models that have personal name fields.
 * Provides a consistent full_name accessor.
 *
 * Requires the model to have: name, paternal_surname, maternal_surname columns.
 */
trait HasFullName
{
    public function getFullNameAttribute(): string
    {
        return trim("{$this->name} {$this->paternal_surname} {$this->maternal_surname}");
    }
}
