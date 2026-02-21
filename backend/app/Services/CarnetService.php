<?php

namespace App\Services;

use App\Exceptions\BusinessException;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\Tenant;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;

class CarnetService
{
    private Writer $qrWriter;

    public function __construct()
    {
        $renderer = new ImageRenderer(
            new RendererStyle(160, 0),
            new SvgImageBackEnd()
        );
        $this->qrWriter = new Writer($renderer);
    }

    /**
     * Get current tenant from app container
     */
    private function getCurrentTenant(): Tenant
    {
        $tenant = app()->bound('current_tenant') ? app('current_tenant') : null;

        if (!$tenant) {
            throw new BusinessException('Tenant no encontrado en el contexto actual');
        }

        return $tenant;
    }

    /**
     * Generate HTML for carnets and store it
     * Processes users in chunks to avoid memory issues
     */
    public function generateHTML(array $filters): string
    {
        return $this->generateHTMLWithProgress($filters);
    }

    /**
     * Generate HTML with progress callback
     */
    public function generateHTMLWithProgress(array $filters, ?callable $progressCallback = null, ?Tenant $tenant = null): string
    {
        ini_set('memory_limit', '1024M');
        set_time_limit(600);

        $tenant = $tenant ?? $this->getCurrentTenant();
        $assets = $this->prepareAssets($tenant);

        $totalUsers = $this->getUserCount($filters);

        if ($totalUsers === 0) {
            throw new BusinessException('No se encontraron usuarios con los filtros especificados');
        }

        Log::info("Generando carnets para {$totalUsers} usuarios");

        $chunkSize = 50;
        $htmlParts = [];
        $offset = 0;
        $processedUsers = 0;

        while ($offset < $totalUsers) {
            $users = $this->getUsersForCarnetsChunk($filters, $offset, $chunkSize);

            if ($users->isEmpty()) {
                break;
            }

            $chunkHtml = view('carnets.template', [
                'users' => $users,
                'tenant' => $tenant,
                'escudoBase64' => $assets['escudo'],
                'fondoBase64' => $assets['fondo'],
                'fontBase64' => $assets['font'],
                'isFirst' => $offset === 0,
                'isLast' => ($offset + $chunkSize) >= $totalUsers,
            ])->render();

            $htmlParts[] = $chunkHtml;

            $processedUsers += $users->count();

            if ($progressCallback) {
                $progress = (int) (($processedUsers / $totalUsers) * 100);
                $progressCallback($progress);
            }

            unset($users, $chunkHtml);
            gc_collect_cycles();

            $offset += $chunkSize;
        }

        $html = implode('', $htmlParts);

        $filename = 'carnets_' . now()->format('Y-m-d_His') . '.html';
        $path = "carnets/{$tenant->id}/{$filename}";

        $disk = config('filesystems.default');
        Storage::disk($disk)->put($path, $html);

        return $path;
    }

    /**
     * Generate PDF from HTML file via carnet-service microservice.
     * The HTML is read from GCS and the resulting PDF is stored back to GCS.
     */
    public function generatePDFFromHTML(string $htmlPath, Tenant $tenant): string
    {
        $filename = 'carnets_' . now()->format('Y-m-d_His') . '.pdf';
        $pdfPath = "carnets/{$tenant->id}/{$filename}";
        $jobId = Str::uuid()->toString();

        $carnetServiceUrl = rtrim(config('services.carnet.url'), '/');
        $secret = config('services.carnet.secret');

        Log::info('Llamando a carnet-service para generación de PDF', [
            'html_gcs_path' => $htmlPath,
            'pdf_gcs_path'  => $pdfPath,
            'job_id'        => $jobId,
        ]);

        $response = Http::withHeaders([
                'X-Carnet-Secret' => $secret,
            ])
            ->timeout(660)
            ->post("{$carnetServiceUrl}/convert", [
                'html_gcs_path' => $htmlPath,
                'pdf_gcs_path'  => $pdfPath,
                'tenant_id'     => $tenant->id,
                'job_id'        => $jobId,
            ]);

        if (! $response->successful()) {
            $error = $response->json('error') ?? $response->body();
            Log::error('carnet-service retornó error', [
                'status'  => $response->status(),
                'error'   => $error,
                'job_id'  => $jobId,
            ]);
            throw new \RuntimeException("Error al generar PDF: {$error}");
        }

        Log::info('PDF generado por carnet-service', [
            'pdf_path'    => $pdfPath,
            'duration_ms' => $response->json('duration_ms'),
            'job_id'      => $jobId,
        ]);

        // Limpiar HTML temporal de GCS
        $disk = config('filesystems.default');
        Storage::disk($disk)->delete($htmlPath);

        return $pdfPath;
    }

    /**
     * Get total count of users based on filters
     */
    public function getUserCount(array $filters): int
    {
        $count = 0;

        if (in_array($filters['type'], ['all', 'student'])) {
            $studentsQuery = Student::query();

            if (!empty($filters['level']) && $filters['level'] !== 'all' && $filters['type'] !== 'all') {
                $studentsQuery->whereHas('classroom', function ($q) use ($filters) {
                    $q->where('level', $filters['level']);

                    if (!empty($filters['grade']) && $filters['grade'] !== 'all') {
                        $q->where('grade', $filters['grade']);
                    }

                    if (!empty($filters['section']) && $filters['section'] !== 'all') {
                        $q->where('section', $filters['section']);
                    }
                });
            }

            $count += $studentsQuery->count();
        }

        if (in_array($filters['type'], ['all', 'teacher'])) {
            $count += Teacher::count();
        }

        return $count;
    }

    /**
     * Get users for carnets in chunks
     * Tenant scope is automatically applied via BelongsToTenant trait
     */
    private function getUsersForCarnetsChunk(array $filters, int $offset, int $limit): Collection
    {
        $users = collect();

        if (in_array($filters['type'], ['all', 'student'])) {
            $studentsQuery = Student::with(['classroom.tutor']);

            if (!empty($filters['level']) && $filters['level'] !== 'all' && $filters['type'] !== 'all') {
                $studentsQuery->whereHas('classroom', function ($q) use ($filters) {
                    $q->where('level', $filters['level']);

                    if (!empty($filters['grade']) && $filters['grade'] !== 'all') {
                        $q->where('grade', $filters['grade']);
                    }

                    if (!empty($filters['section']) && $filters['section'] !== 'all') {
                        $q->where('section', $filters['section']);
                    }
                });
            }

            if ($filters['type'] === 'student') {
                $students = $studentsQuery->offset($offset)->limit($limit)->get();
            } else {
                $studentCount = $studentsQuery->count();

                if ($offset < $studentCount) {
                    $studentsToFetch = min($limit, $studentCount - $offset);
                    $students = $studentsQuery->offset($offset)->limit($studentsToFetch)->get();
                } else {
                    $students = collect();
                }
            }

            foreach ($students as $student) {
                $this->processStudentForCarnet($student);
            }

            $users = $users->merge($students);
        }

        if (in_array($filters['type'], ['all', 'teacher'])) {
            if ($filters['type'] === 'teacher') {
                $teachers = Teacher::offset($offset)->limit($limit)->get();
            } else {
                $studentCount = Student::query()->count();

                if ($offset >= $studentCount) {
                    $teacherOffset = $offset - $studentCount;
                    $teachers = Teacher::offset($teacherOffset)->limit($limit)->get();
                } elseif (($offset + $limit) > $studentCount) {
                    $remainingSlots = $limit - $users->count();
                    $teachers = Teacher::limit($remainingSlots)->get();
                } else {
                    $teachers = collect();
                }
            }

            foreach ($teachers as $teacher) {
                $this->processTeacherForCarnet($teacher);
            }

            $users = $users->merge($teachers);
        }

        return $users;
    }

    /**
     * Process student data for carnet
     */
    private function processStudentForCarnet(Student $student): void
    {
        try {
            if ($student->qr_code) {
                $pngData = $this->qrWriter->writeString((string) $student->qr_code);
                $student->qr_base64 = base64_encode($pngData);
            } else {
                $student->qr_base64 = '';
            }

            $student->user_type = 'student';

            if (!isset($student->full_name)) {
                $student->full_name = trim("{$student->name} {$student->paternal_surname} {$student->maternal_surname}");
            }
        } catch (\Throwable $e) {
            Log::error("Error procesando estudiante para carnet ID={$student->id}", [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            $student->qr_base64 = '';
        }
    }

    /**
     * Process teacher data for carnet
     */
    private function processTeacherForCarnet(Teacher $teacher): void
    {
        try {
            if ($teacher->qr_code) {
                $pngData = $this->qrWriter->writeString((string) $teacher->qr_code);
                $teacher->qr_base64 = base64_encode($pngData);
            } else {
                $teacher->qr_base64 = '';
            }

            $teacher->user_type = 'teacher';

            if (!isset($teacher->full_name)) {
                $teacher->full_name = trim("{$teacher->name} {$teacher->paternal_surname} {$teacher->maternal_surname}");
            }
        } catch (\Throwable $e) {
            Log::error("Error procesando docente para carnet ID={$teacher->id}", [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            $teacher->qr_base64 = '';
        }
    }

    /**
     * Prepare assets (images, fonts) as base64
     * Handles both local storage and cloud storage (GCS)
     */
    private function prepareAssets(Tenant $tenant): array
    {
        $assets = [];

        if ($tenant->banner_url) {
            $tenantDisk = config('filesystems.default');

            $pathInfo = pathinfo($tenant->banner_url);
            $darkVariantPath = $pathInfo['dirname'] . '/' . $pathInfo['filename'] . '_dark.' . $pathInfo['extension'];

            $logoContent = null;

            try {
                if (Storage::disk($tenantDisk)->exists($darkVariantPath)) {
                    $logoContent = Storage::disk($tenantDisk)->get($darkVariantPath);
                } elseif (Storage::disk($tenantDisk)->exists($tenant->banner_url)) {
                    $logoContent = Storage::disk($tenantDisk)->get($tenant->banner_url);
                }

                if ($logoContent) {
                    $assets['escudo'] = base64_encode($logoContent);
                } else {
                    $assets['escudo'] = $this->getDefaultAsset('escudo.png');
                }
            } catch (\Exception $e) {
                Log::warning("Error cargando logo del tenant desde storage", [
                    'banner_url' => $tenant->banner_url,
                    'disk' => $tenantDisk,
                    'error' => $e->getMessage()
                ]);
                $assets['escudo'] = $this->getDefaultAsset('escudo.png');
            }
        } else {
            $assets['escudo'] = $this->getDefaultAsset('escudo.png');
        }

        $assets['fondo'] = $this->getDefaultAsset('carnet_background.png', 'images');

        $assets['font'] = $this->getDefaultAsset('ChauPhilomeneOne.ttf', 'fonts');

        return $assets;
    }

    /**
     * Get default asset from public directory
     */
    private function getDefaultAsset(string $filename, string $subdir = 'images'): string
    {
        $path = public_path("{$subdir}/{$filename}");

        if (file_exists($path)) {
            return base64_encode(file_get_contents($path));
        }

        Log::warning("Asset no encontrado: {$path}");
        return '';
    }

    /**
     * Get the stored HTML path for preview
     */
    public function getHTMLPath(): ?string
    {
        $tenant = $this->getCurrentTenant();
        return $tenant->carnet_template_path;
    }

    /**
     * Get the HTML content for preview
     */
    public function getHTMLContent(): ?string
    {
        $path = $this->getHTMLPath();
        $disk = config('filesystems.default');

        if (!$path || !Storage::disk($disk)->exists($path)) {
            return null;
        }

        return Storage::disk($disk)->get($path);
    }

    /**
     * Delete old carnet files (HTML and PDFs)
     * Deletes from both local storage and default disk (GCS in production)
     */
    public function cleanupOldFiles(int $daysOld = 7): int
    {
        $count = 0;
        $cutoffDate = now()->subDays($daysOld);
        $disk = config('filesystems.default');

        try {
            $files = Storage::disk($disk)->files('carnets');

            foreach ($files as $file) {
                $lastModified = Storage::disk($disk)->lastModified($file);

                if ($lastModified < $cutoffDate->timestamp) {
                    Storage::disk($disk)->delete($file);
                    $count++;
                    Log::info("LIMPIEZA - Archivo eliminado del storage", [
                        'file' => $file,
                        'disk' => $disk,
                    ]);
                }
            }
        } catch (\Exception $e) {
            Log::error("Error limpiando archivos de carnets", [
                'disk' => $disk,
                'error' => $e->getMessage(),
            ]);
        }

        if ($disk !== 'public') {
            try {
                $localFiles = Storage::disk('public')->files('carnets');

                foreach ($localFiles as $file) {
                    $lastModified = Storage::disk('public')->lastModified($file);

                    if ($lastModified < $cutoffDate->timestamp) {
                        Storage::disk('public')->delete($file);
                        $count++;
                    }
                }
            } catch (\Exception $e) {
                Log::warning("Error limpiando archivos locales", [
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $count;
    }
}