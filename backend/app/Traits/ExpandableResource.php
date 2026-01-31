<?php

namespace App\Traits;

trait ExpandableResource
{
    /**
     * Get the list of relations to expand from the request.
     *
     * @return array
     */
    protected function getExpandedRelations(): array
    {
        $request = request();
        $expand = $request->query('expand', '');

        if (empty($expand)) {
            return [];
        }

        return array_map('trim', explode(',', $expand));
    }

    /**
     * Check if a specific relation should be expanded.
     *
     * @param string $relation
     * @return bool
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
}
