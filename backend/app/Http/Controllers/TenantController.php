<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use Illuminate\Http\JsonResponse;

class TenantController extends Controller
{
    /**
     * Get tenant by slug (public endpoint)
     *
     * GET /api/tenants/{slug}
     *
     * @param string $slug
     * @return JsonResponse
     */
    public function getBySlug(string $slug): JsonResponse
    {
        $tenant = Tenant::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        return response()->json([
            'id' => $tenant->id,
            'name' => $tenant->name,
            'slug' => $tenant->slug,
            'ugel' => $tenant->ugel,
            'logo_url' => get_storage_url($tenant->logo_url),
            'banner_url' => get_storage_url($tenant->banner_url),
            'background_url' => get_storage_url($tenant->background_url),
        ]);
    }
}