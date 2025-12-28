<?php

namespace App\Http\Controllers\Carnets;

use App\Http\Controllers\Controller;
use App\Jobs\GenerateCarnetsJob;
use App\Models\CarnetGeneration;
use App\Services\CarnetService;
use App\Traits\LogsActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class CarnetController extends Controller
{
    use LogsActivity;

    public function __construct(
        private CarnetService $carnetService
    ) {}

    /**
     * Generate carnets (dispatch job)
     *
     * POST /api/carnets/generate
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function generate(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'required|in:all,student,teacher',
            'level' => 'nullable|string',
            'grade' => 'nullable|string',
            'section' => 'nullable|string',
        ]);

        try {
            $user = Auth::user();
            $tenant = app('current_tenant');
            $totalUsers = $this->carnetService->getUserCount($request->all());

            if ($totalUsers === 0) {
                return $this->error('No se encontraron usuarios con los filtros especificados', null, 404);
            }

            $carnetGeneration = CarnetGeneration::create([
                'tenant_id' => $tenant->id,
                'user_id' => $user->id,
                'filters' => $request->all(),
                'status' => 'pending',
                'total_users' => $totalUsers,
            ]);

            GenerateCarnetsJob::dispatch($carnetGeneration);

            $this->logActivity('carnet_generation_requested', $carnetGeneration, [
                'total_users' => $totalUsers,
                'filters' => $request->all(),
            ]);

            return $this->success([
                'job_id' => $carnetGeneration->id,
                'status' => $carnetGeneration->status,
                'total_users' => $totalUsers,
            ], 'Generación de carnets iniciada');
        } catch (\Exception $e) {
            Log::error('Error despachando job de carnets', [
                'message' => $e->getMessage(),
            ]);

            return $this->error(
                'Error al iniciar generación de carnets: ' . $e->getMessage(),
                null,
                500
            );
        }
    }

    /**
     * Get job status
     *
     * GET /api/carnets/status/{jobId}
     *
     * @param int $jobId
     * @return JsonResponse
     */
    public function status(int $jobId): JsonResponse
    {
        try {
            $carnetGeneration = CarnetGeneration::findOrFail($jobId);
            $tenant = app('current_tenant');

            if ($carnetGeneration->tenant_id !== $tenant->id) {
                return $this->error('No autorizado', null, 403);
            }

            $response = [
                'id' => $carnetGeneration->id,
                'status' => $carnetGeneration->status,
                'progress' => $carnetGeneration->progress,
                'total_users' => $carnetGeneration->total_users,
                'created_at' => $carnetGeneration->created_at->toISOString(),
            ];

            if ($carnetGeneration->isCompleted()) {
                $response['pdf_url'] = route('carnets.download', ['jobId' => $carnetGeneration->id]);
                $response['completed_at'] = $carnetGeneration->completed_at?->toISOString();
            }

            if ($carnetGeneration->isFailed()) {
                $response['error_message'] = $carnetGeneration->error_message;
            }

            return $this->success($response);
        } catch (\Exception) {
            return $this->error('Generación no encontrada', null, 404);
        }
    }

    /**
     * Download generated PDF
     *
     * GET /api/carnets/download/{jobId}
     *
     * @param int $jobId
     * @return mixed
     */
    public function download(int $jobId): mixed
    {
        try {
            $carnetGeneration = CarnetGeneration::findOrFail($jobId);
            $tenant = app('current_tenant');

            if ($carnetGeneration->tenant_id !== $tenant->id) {
                return response()->json(['message' => 'No autorizado'], 403);
            }

            if (!$carnetGeneration->isCompleted()) {
                return response()->json(['message' => 'La generación aún no se ha completado'], 400);
            }

            if (!$carnetGeneration->pdf_path || !Storage::disk('public')->exists($carnetGeneration->pdf_path)) {
                return response()->json(['message' => 'PDF no encontrado'], 404);
            }

            $this->logActivity('carnet_generation_downloaded', $carnetGeneration);

            $filename = basename($carnetGeneration->pdf_path);
            $fullPath = Storage::disk('public')->path($carnetGeneration->pdf_path);

            return response()->download($fullPath, $filename);
        } catch (\Exception) {
            return response()->json(['message' => 'Error al descargar PDF'], 500);
        }
    }

    /**
     * Cancel pending job
     *
     * DELETE /api/carnets/{jobId}
     *
     * @param int $jobId
     * @return JsonResponse
     */
    public function cancel(int $jobId): JsonResponse
    {
        try {
            $carnetGeneration = CarnetGeneration::findOrFail($jobId);
            $tenant = app('current_tenant');

            if ($carnetGeneration->tenant_id !== $tenant->id) {
                return $this->error('No autorizado', null, 403);
            }

            if (!$carnetGeneration->isPending()) {
                return $this->error('Solo se pueden cancelar trabajos pendientes', null, 400);
            }

            $carnetGeneration->markAsFailed('Cancelado por el usuario');

            return $this->success(null, 'Generación cancelada');
        } catch (\Exception) {
            return $this->error('Error al cancelar generación', null, 500);
        }
    }
}
