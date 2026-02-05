<?php

namespace App\Traits;

use Illuminate\Http\Request;

trait HasExpandableRelations
{
    /**
     * Parse the ?expand= query parameter into an array of relation names.
     *
     * Usage:
     * - ?expand=classroom           => ['classroom']
     * - ?expand=classroom,parents   => ['classroom', 'parents']
     * - (no parameter)              => []
     *
     * @param Request $request
     */
    protected function parseExpand(Request $request): array
    {
        return $this->parseExpandString($request->query('expand', ''));
    }

    /**
     * Get the list of relations to expand from the current request.
     * Used primarily in Resources where we don't have direct access to Request.
     */
    protected function getExpandedRelations(): array
    {
        return $this->parseExpandString(request()->query('expand', ''));
    }

    /**
     * Check if a specific relation should be expanded.
     *
     * @param string $relation
     */
    protected function shouldExpand(string $relation): bool
    {
        return in_array($relation, $this->getExpandedRelations());
    }

    /**
     * Return expanded data if requested and loaded, otherwise return null.
     * Use this for optional expansions that default to not showing.
     *
     * @param string $relation
     * @param callable $callback
     * @return mixed
     */
    protected function whenExpanded(string $relation, callable $callback)
    {
        if ($this->shouldExpand($relation) && $this->relationLoaded($relation)) {
            return $callback();
        }

        return null;
    }

    /**
     * Return expanded data if requested and loaded, otherwise return the fallback.
     * Useful for returning ID when not expanded, full object when expanded.
     *
     * @param string $relation
     * @param mixed $fallback Value to return when not expanded (typically the ID)
     * @param callable $callback Function to call when expanded
     * @return mixed
     */
    protected function expandOrFallback(string $relation, $fallback, callable $callback)
    {
        if ($this->shouldExpand($relation) && $this->relationLoaded($relation)) {
            return $callback();
        }

        return $fallback;
    }

    /**
     * Parse an expand string into an array.
     */
    private function parseExpandString(string $expand): array
    {
        if (empty($expand)) {
            return [];
        }

        return array_map('trim', explode(',', $expand));
    }
}
