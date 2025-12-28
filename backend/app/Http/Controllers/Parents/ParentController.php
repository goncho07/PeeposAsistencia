<?php

namespace App\Http\Controllers\Parents;

use App\Http\Controllers\Controller;
use App\Http\Requests\Parents\ParentStoreRequest;
use App\Http\Requests\Parents\ParentUpdateRequest;
use App\Http\Resources\ParentResource;
use App\Services\ParentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ParentController extends Controller
{
    public function __construct(
        private ParentService $parentService
    ) {}

    /**
     * Display a listing of parents
     *
     * GET /api/parents
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $search = $request->query('search');

            $parents = $this->parentService->getAllParents($search);

            return $this->success(
                ParentResource::collection($parents),
                'Apoderados obtenidos exitosamente'
            );
        } catch (\Exception $e) {
            return $this->error('Error al obtener apoderados: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Display the specified parent
     *
     * GET /api/parents/{id}
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        try {
            $parent = $this->parentService->findById($id);

            return $this->success(
                new ParentResource($parent),
                'Apoderado obtenido exitosamente'
            );
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->error('Apoderado no encontrado', null, 404);
        } catch (\Exception $e) {
            return $this->error('Error al obtener apoderado: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Store a newly created parent
     *
     * POST /api/parents
     *
     * @param ParentStoreRequest $request
     * @return JsonResponse
     */
    public function store(ParentStoreRequest $request): JsonResponse
    {
        try {
            $parent = $this->parentService->create($request->validated());

            return $this->created(
                new ParentResource($parent),
                'Apoderado creado exitosamente'
            );
        } catch (\Exception $e) {
            return $this->error('Error al crear apoderado: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Update the specified parent
     *
     * PUT/PATCH /api/parents/{id}
     *
     * @param ParentUpdateRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(ParentUpdateRequest $request, int $id): JsonResponse
    {
        try {
            $parent = $this->parentService->update($id, $request->validated());

            return $this->success(
                new ParentResource($parent),
                'Apoderado actualizado exitosamente'
            );
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->error('Apoderado no encontrado', null, 404);
        } catch (\Exception $e) {
            return $this->error('Error al actualizar apoderado: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Remove the specified parent
     *
     * DELETE /api/parents/{id}
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->parentService->delete($id);

            return $this->success(null, 'Apoderado eliminado exitosamente');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->error('Apoderado no encontrado', null, 404);
        } catch (\Exception $e) {
            return $this->error('Error al eliminar apoderado: ' . $e->getMessage(), null, 500);
        }
    }
}
