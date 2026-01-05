<?php

namespace App\Jobs;

use App\Models\CarnetGeneration;
use App\Services\CarnetService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Spatie\Browsershot\Browsershot;

class GenerateCarnetsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 2;
    public $timeout = 600;
    public $maxExceptions = 2;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public CarnetGeneration $carnetGeneration
    ) {}

    /**
     * Execute the job.
     */
    public function handle(CarnetService $carnetService): void
    {
        set_time_limit(600);
        ini_set('memory_limit', '2048M');

        try {
            app()->instance('current_tenant', $this->carnetGeneration->tenant);
            app()->instance('current_tenant_id', $this->carnetGeneration->tenant_id);

            $this->carnetGeneration->markAsProcessing();

            $htmlPath = $carnetService->generateHTMLWithProgress(
                $this->carnetGeneration->filters,
                function (int $progress) {
                    $scaledProgress = (int) ($progress * 0.9);
                    $this->carnetGeneration->updateProgress($scaledProgress);
                },
                $this->carnetGeneration->tenant
            );

            $this->carnetGeneration->updateProgress(90);
            $pdfPath = $this->generatePDF($htmlPath);
            $this->carnetGeneration->markAsCompleted($pdfPath);
        } catch (\Throwable $e) {
            Log::error('Error generando carnets', [
                'generation_id' => $this->carnetGeneration->id,
                'message' => $e->getMessage(),
            ]);

            $this->carnetGeneration->markAsFailed($e->getMessage());
            throw $e;
        }
    }

    /**
     * Generate PDF from HTML
     */
    private function generatePDF(string $htmlPath): string
    {
        $html = Storage::disk('public')->get($htmlPath);
        $this->carnetGeneration->updateProgress(92);

        $browsershot = Browsershot::html($html)
            ->setChromePath(env('CHROMIUM_PATH', '/usr/bin/chromium'))
            ->setNodeBinary(env('NODE_BINARY', '/usr/bin/node'))
            ->setNpmBinary(env('NPM_BINARY', '/usr/bin/npm'))
            ->setOption('args', [
                '--no-sandbox',
                '--disable-gpu',
                '--disable-dev-shm-usage',
                '--disable-software-rasterizer',
                '--disable-extensions',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process',
            ])
            ->timeout(600)
            ->setOption('waitUntil', 'domcontentloaded')
            ->setOption('protocolTimeout', 600000)
            ->setOption('preferCSSPageSize', true)
            ->showBackground()
            ->format('A4')
            ->margins(0, 0, 0, 0)
            ->noSandbox()
            ->dismissDialogs();

        $this->carnetGeneration->updateProgress(95);
        $pdfBinary = $browsershot->pdf();
        $this->carnetGeneration->updateProgress(98);

        $filename = 'carnets_' . now()->format('Y-m-d_His') . '.pdf';
        $pdfPath = "carnets/{$this->carnetGeneration->tenant_id}/{$filename}";

        $disk = config('filesystems.default');
        Storage::disk($disk)->put($pdfPath, $pdfBinary);

        Log::info('PDF guardado en storage', [
            'path' => $pdfPath,
            'disk' => $disk,
            'size' => strlen($pdfBinary),
        ]);

        return $pdfPath;
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Job de generación de carnets falló definitivamente', [
            'generation_id' => $this->carnetGeneration->id,
            'message' => $exception->getMessage(),
        ]);

        $this->carnetGeneration->markAsFailed($exception->getMessage());
    }
}
