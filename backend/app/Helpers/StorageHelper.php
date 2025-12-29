<?php

if (!function_exists('get_storage_url')) {
    /**
     * Get the public URL for a storage file
     *
     * @param string|null $path
     * @param string|null $disk
     * @return string
     */
    function get_storage_url(?string $path, ?string $disk = null): string
    {
        if (!$path) {
            return '';
        }

        $disk = $disk ?? config('filesystems.default');

        // For GCS, generate public URL directly
        if ($disk === 'gcs') {
            $bucket = config('filesystems.disks.gcs.bucket');
            $pathPrefix = config('filesystems.disks.gcs.path_prefix', '');

            $fullPath = $pathPrefix ? trim($pathPrefix, '/') . '/' . ltrim($path, '/') : ltrim($path, '/');

            return "https://storage.googleapis.com/{$bucket}/{$fullPath}";
        }

        // For public disk, construct URL manually
        if ($disk === 'public') {
            $baseUrl = rtrim(config('app.url'), '/');
            return "{$baseUrl}/storage/" . ltrim($path, '/');
        }

        // For local disk, construct URL manually
        if ($disk === 'local') {
            $baseUrl = rtrim(config('app.url'), '/');
            return "{$baseUrl}/storage/" . ltrim($path, '/');
        }

        // Generic fallback: attempt to call url() method if it exists
        try {
            $diskInstance = \Illuminate\Support\Facades\Storage::disk($disk);

            // Check if the adapter supports url() method
            if (method_exists($diskInstance, 'url')) {
                /** @var \Illuminate\Filesystem\FilesystemAdapter $diskInstance */
                return $diskInstance->url($path);
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error generating storage URL', [
                'path' => $path,
                'disk' => $disk,
                'error' => $e->getMessage()
            ]);
        }

        return '';
    }
}
