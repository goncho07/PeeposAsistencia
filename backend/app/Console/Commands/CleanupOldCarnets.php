<?php

namespace App\Console\Commands;

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

        $deletedPdfs = 0;
        $deletedHtmls = 0;

        // Cleanup old files in carnets directory (both public and default disk)
        $disks = ['public', config('filesystems.default')];
        $disks = array_unique($disks);

        foreach ($disks as $disk) {
            if (!Storage::disk($disk)->exists('carnets')) {
                continue;
            }

            $allCarnetsFiles = Storage::disk($disk)->allFiles('carnets');

            foreach ($allCarnetsFiles as $file) {
                $lastModified = Storage::disk($disk)->lastModified($file);

                if ($lastModified < $cutoffDate->timestamp) {
                    Storage::disk($disk)->delete($file);

                    if (str_ends_with($file, '.html')) {
                        $deletedHtmls++;
                    } elseif (str_ends_with($file, '.pdf')) {
                        $deletedPdfs++;
                    }
                }
            }
        }

        $this->info("✓ Archivos PDF eliminados: {$deletedPdfs}");
        $this->info("✓ Archivos HTML eliminados: {$deletedHtmls}");
        $this->info('Limpieza completada exitosamente.');

        return self::SUCCESS;
    }
}
