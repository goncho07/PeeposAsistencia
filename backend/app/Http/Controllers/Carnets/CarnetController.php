<?php

namespace App\Http\Controllers\Carnets;

use App\Http\Controllers\Controller;
use App\Services\CarnetService;
use App\Traits\LogsActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CarnetController extends Controller
{
    use LogsActivity;

    public function __construct(
        private CarnetService $carnetService
    ) {}

    /**
     * Generate carnets with SSE streaming progress
     *
     * POST /api/carnets/generate
     *
     * @param Request $request
     * @return StreamedResponse
     */
    public function generate(Request $request): StreamedResponse
    {
        $request->validate([
            'type' => 'required|in:all,student,teacher',
            'level' => 'nullable|string',
            'grade' => 'nullable|string',
            'section' => 'nullable|string',
        ]);

        $filters = $request->all();
        $tenant = app('current_tenant');

        return new StreamedResponse(function () use ($filters, $tenant) {
            if (ob_get_level()) {
                ob_end_clean();
            }

            set_time_limit(600);
            ini_set('memory_limit', '2048M');

            try {
                $totalUsers = $this->carnetService->getUserCount($filters);

                if ($totalUsers === 0) {
                    $this->sendSSE('error', [
                        'message' => 'No se encontraron usuarios con los filtros especificados'
                    ]);
                    return;
                }

                $this->sendSSE('start', [
                    'total_users' => $totalUsers,
                    'message' => 'Iniciando generación de carnets'
                ]);

                $htmlPath = $this->carnetService->generateHTMLWithProgress(
                    $filters,
                    function (int $progress) {
                        $this->sendSSE('progress', [
                            'progress' => min($progress, 85),
                            'phase' => 'html'
                        ]);
                    },
                    $tenant
                );

                $this->sendSSE('progress', [
                    'progress' => 90,
                    'phase' => 'pdf',
                    'message' => 'Generando PDF...'
                ]);

                $pdfPath = $this->carnetService->generatePDFFromHTML($htmlPath, $tenant);

                $this->sendSSE('progress', [
                    'progress' => 100,
                    'phase' => 'complete'
                ]);

                $downloadUrl = route('carnets.download.direct', ['path' => base64_encode($pdfPath)]);

                $this->sendSSE('completed', [
                    'pdf_url' => $downloadUrl,
                    'pdf_path' => $pdfPath,
                    'message' => 'Carnets generados exitosamente'
                ]);

                $this->logActivity('carnet_generation_completed', null, [
                    'total_users' => $totalUsers,
                    'filters' => $filters,
                ]);

            } catch (\Throwable $e) {
                Log::error('Error generando carnets via SSE', [
                    'message' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);

                $this->sendSSE('error', [
                    'message' => 'Error al generar carnets: ' . $e->getMessage()
                ]);
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ]);
    }

    /**
     * Send SSE event
     */
    private function sendSSE(string $event, array $data): void
    {
        echo "event: {$event}\n";
        echo "data: " . json_encode($data) . "\n\n";

        if (ob_get_level()) {
            ob_flush();
        }
        flush();
    }

    /**
     * Download PDF directly by path
     *
     * GET /api/carnets/download/{path}
     *
     * @param string $path Base64 encoded path
     * @return mixed
     */
    public function downloadDirect(string $path): mixed
    {
        try {
            $pdfPath = base64_decode($path);
            $tenant = app('current_tenant');

            if (!str_contains($pdfPath, "carnets/{$tenant->id}/")) {
                return response()->json(['message' => 'No autorizado'], 403);
            }

            $disk = config('filesystems.default');

            if (!Storage::disk($disk)->exists($pdfPath)) {
                Log::warning('PDF no encontrado', [
                    'pdf_path' => $pdfPath,
                    'disk' => $disk,
                ]);
                return response()->json(['message' => 'PDF no encontrado'], 404);
            }

            $this->logActivity('carnet_downloaded', null, ['path' => $pdfPath]);

            $filename = basename($pdfPath);
            $pdfContent = Storage::disk($disk)->get($pdfPath);

            return response($pdfContent)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
        } catch (\Exception $e) {
            Log::error('Error descargando PDF', [
                'path' => $path,
                'error' => $e->getMessage(),
            ]);
            return response()->json(['message' => 'Error al descargar PDF'], 500);
        }
    }

    /**
     * Get user count for filters (for preview)
     *
     * POST /api/carnets/count
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function count(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'required|in:all,student,teacher',
            'level' => 'nullable|string',
            'grade' => 'nullable|string',
            'section' => 'nullable|string',
        ]);

        try {
            $count = $this->carnetService->getUserCount($request->all());

            return $this->success([
                'count' => $count,
            ]);
        } catch (\Exception $e) {
            return $this->error('Error al contar usuarios', null, 500);
        }
    }
}
