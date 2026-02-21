<?php

namespace App\Http\Controllers;

use App\Exceptions\BusinessException;
use App\Http\Requests\Tenants\TenantImageUploadRequest;
use App\Http\Requests\Tenants\TenantStoreRequest;
use App\Http\Requests\Tenants\TenantUpdateRequest;
use App\Http\Resources\TenantResource;
use App\Services\AcademicYearService;
use App\Services\TenantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TenantController extends Controller
{
    public function __construct(
        private TenantService $tenantService,
        private AcademicYearService $academicYearService
    ) {}

    /**
     * Get tenant by slug (public endpoint).
     *
     * GET /api/tenant/{slug}
     */
    public function getBySlug(string $slug): JsonResponse
    {
        try {
            $tenant = $this->tenantService->findBySlug($slug);

            return $this->success([
                'id' => $tenant->id,
                'name' => $tenant->name,
                'slug' => $tenant->slug,
                'ugel' => $tenant->ugel,
                'logo_url' => get_storage_url($tenant->logo_url),
                'banner_url' => get_storage_url($tenant->banner_url),
                'background_url' => get_storage_url($tenant->background_url),
                'primary_color' => $tenant->primary_color,
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->error('Institución no encontrada', null, 404);
        }
    }

    /**
     * Get global stats for superadmin dashboard.
     *
     * GET /api/superadmin/stats
     */
    public function stats(): JsonResponse
    {
        return $this->success($this->tenantService->getGlobalStats());
    }

    /**
     * List all tenants with counts (superadmin).
     *
     * GET /api/superadmin/tenants
     * GET /api/superadmin/tenants?search=colegio
     * GET /api/superadmin/tenants?is_active=true
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $tenants = $this->tenantService->getAllTenants(
                $request->query('search'),
                $request->has('is_active') ? $request->boolean('is_active') : null
            );

            return $this->success(TenantResource::collection($tenants));
        } catch (\Exception $e) {
            return $this->error('Error al obtener tenants: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Create a new tenant (superadmin).
     *
     * POST /api/superadmin/tenants
     */
    public function store(TenantStoreRequest $request): JsonResponse
    {
        try {
            $tenant = $this->tenantService->create($request->validated());

            return $this->created(
                new TenantResource($tenant),
                'Tenant creado exitosamente'
            );
        } catch (\Exception $e) {
            return $this->error('Error al crear tenant: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Show a specific tenant (superadmin).
     *
     * GET /api/superadmin/tenants/{id}
     */
    public function show(int $id): JsonResponse
    {
        try {
            $tenant = $this->tenantService->findById($id);

            return $this->success(new TenantResource($tenant));
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->error('Tenant no encontrado', null, 404);
        } catch (\Exception $e) {
            return $this->error('Error al obtener tenant: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Update a tenant (superadmin).
     *
     * PUT/PATCH /api/superadmin/tenants/{id}
     */
    public function update(TenantUpdateRequest $request, int $id): JsonResponse
    {
        try {
            $tenant = $this->tenantService->update($id, $request->validated());

            return $this->success(
                new TenantResource($tenant),
                'Tenant actualizado exitosamente'
            );
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->error('Tenant no encontrado', null, 404);
        } catch (\Exception $e) {
            return $this->error('Error al actualizar tenant: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Delete a tenant (superadmin).
     *
     * DELETE /api/superadmin/tenants/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->tenantService->delete($id);

            return $this->success(null, 'Tenant eliminado exitosamente');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->error('Tenant no encontrado', null, 404);
        } catch (BusinessException $e) {
            return $this->error($e->getMessage(), null, 422);
        } catch (\Exception $e) {
            return $this->error('Error al eliminar tenant: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Toggle tenant active status (superadmin).
     *
     * POST /api/superadmin/tenants/{id}/toggle-active
     */
    public function toggleActive(int $id): JsonResponse
    {
        try {
            $tenant = $this->tenantService->toggleActive($id);

            return $this->success(
                ['is_active' => $tenant->is_active],
                $tenant->is_active ? 'Tenant activado' : 'Tenant desactivado'
            );
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->error('Tenant no encontrado', null, 404);
        } catch (\Exception $e) {
            return $this->error('Error al cambiar estado: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Enter a tenant context (superadmin only).
     *
     * POST /api/superadmin/tenants/{id}/enter
     */
    public function enterTenant(Request $request, int $id): JsonResponse
    {
        try {
            $tenant = $this->tenantService->enterTenant($request->user(), $id);

            return $this->success([
                'tenant' => [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                    'slug' => $tenant->slug,
                    'logo_url' => get_storage_url($tenant->logo_url),
                ],
            ], "Ahora estás viendo: {$tenant->name}");
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->error('Tenant no encontrado', null, 404);
        } catch (BusinessException $e) {
            return $this->error($e->getMessage(), null, 403);
        } catch (\Exception $e) {
            return $this->error('Error al entrar al tenant: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Exit from tenant context (superadmin only).
     *
     * POST /api/superadmin/tenants/exit
     */
    public function exitTenant(Request $request): JsonResponse
    {
        try {
            $this->tenantService->exitTenant($request->user());

            return $this->success(null, 'Has salido del contexto del tenant');
        } catch (BusinessException $e) {
            return $this->error($e->getMessage(), null, 403);
        } catch (\Exception $e) {
            return $this->error('Error al salir del tenant: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Upload tenant image (logo, banner, background).
     *
     * POST /api/superadmin/tenants/{id}/upload-image
     */
    public function uploadImage(TenantImageUploadRequest $request, int $id): JsonResponse
    {
        try {
            $tenant = $this->tenantService->findById($id);
            $path = $this->tenantService->uploadImage(
                $tenant,
                $request->file('image'),
                $request->type
            );

            return $this->success(
                ['url' => get_storage_url($path)],
                ucfirst($request->type) . ' actualizado exitosamente'
            );
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->error('Tenant no encontrado', null, 404);
        } catch (\Exception $e) {
            return $this->error('Error al subir imagen: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Bulk-create an academic year for all active tenants.
     *
     * POST /api/superadmin/academic-years/bulk
     */
    public function bulkCreateAcademicYear(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'year' => 'required|integer|min:2020|max:2099',
            'bimesters' => 'required|array|size:4',
            'bimesters.*.start_date' => 'required|date',
            'bimesters.*.end_date' => 'required|date|after:bimesters.*.start_date',
        ]);

        try {
            $result = $this->academicYearService->bulkCreateForAllTenants($validated);

            $message = "Año {$validated['year']} creado en {$result['created']} institución(es)";
            if ($result['skipped'] > 0) {
                $message .= ", {$result['skipped']} omitida(s) (ya existía)";
            }

            return $this->success($result, $message);
        } catch (\Exception $e) {
            return $this->error('Error al crear año académico global: ' . $e->getMessage(), null, 500);
        }
    }
}
