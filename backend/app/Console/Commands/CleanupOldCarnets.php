<?php

namespace App\Console\Commands;

use App\Models\CarnetGeneration;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class CleanupOldCarnets extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'carnets:cleanup {--days=7 : Number of days to keep carnet files}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cleanup old carnet PDF and HTML files';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $days = (int) $this->option('days');
        $cutoffDate = now()->subDays($days);

        $this->info("Limpiando archivos de carnets generados antes de {$cutoffDate->toDateTimeString()}...");

        // Find old completed generations
        $oldGenerations = CarnetGeneration::where('status', 'completed')
            ->where('completed_at', '<', $cutoffDate)
            ->get();

        $deletedPdfs = 0;
        $deletedHtmls = 0;
        $deletedRecords = 0;

        foreach ($oldGenerations as $generation) {
            // Delete PDF file
            if ($generation->pdf_path && Storage::disk('public')->exists($generation->pdf_path)) {
                Storage::disk('public')->delete($generation->pdf_path);
                $deletedPdfs++;
            }

            // Delete the record
            $generation->delete();
            $deletedRecords++;
        }

        // Also cleanup orphaned HTML files in carnets directory
        $allCarnetsFiles = Storage::disk('public')->allFiles('carnets');

        foreach ($allCarnetsFiles as $file) {
            $lastModified = Storage::disk('public')->lastModified($file);

            if ($lastModified < $cutoffDate->timestamp) {
                Storage::disk('public')->delete($file);

                if (str_ends_with($file, '.html')) {
                    $deletedHtmls++;
                } elseif (str_ends_with($file, '.pdf')) {
                    $deletedPdfs++;
                }
            }
        }

        $this->info("✓ Archivos PDF eliminados: {$deletedPdfs}");
        $this->info("✓ Archivos HTML eliminados: {$deletedHtmls}");
        $this->info("✓ Registros eliminados: {$deletedRecords}");
        $this->info('Limpieza completada exitosamente.');

        return self::SUCCESS;
    }
}
