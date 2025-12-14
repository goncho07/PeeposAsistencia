<?php

namespace App\Traits;

trait HasSearchableFields
{
    protected function applySearchFilter($query, string $search, array $fields): void
    {
        $query->where(function ($q) use ($search, $fields) {
            foreach ($fields as $field) {
                $q->orWhere($field, 'like', "%{$search}%");
            }
        });
    }
}
