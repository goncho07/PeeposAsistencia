<?php

namespace App\Traits;

use Illuminate\Http\Request;

trait ParsesExpandParameter
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
     * @return array
     */
    protected function parseExpand(Request $request): array
    {
        $expand = $request->query('expand', '');

        if (empty($expand)) {
            return [];
        }

        return array_map('trim', explode(',', $expand));
    }
}
