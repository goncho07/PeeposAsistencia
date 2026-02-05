<?php

namespace App\Traits;

trait HasActiveStatus
{
    /**
     * Get the value that represents "active" status.
     * Override this in your model if using a different value.
     */
    public function getActiveStatusValue(): string
    {
        return 'ACTIVO';
    }

    /**
     * Check if the model is active.
     */
    public function isActive(): bool
    {
        return $this->status === $this->getActiveStatusValue();
    }

    /**
     * Check if the model is inactive.
     */
    public function isInactive(): bool
    {
        return !$this->isActive();
    }

    /**
     * Scope to filter only active records.
     */
    public function scopeActive($query)
    {
        return $query->where('status', $this->getActiveStatusValue());
    }

    /**
     * Scope to filter only inactive records.
     */
    public function scopeInactive($query)
    {
        return $query->where('status', '!=', $this->getActiveStatusValue());
    }

    /**
     * Scope to filter by specific status.
     */
    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }
}
