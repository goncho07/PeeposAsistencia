<?php

if (!function_exists('get_storage_url')) {

    function get_storage_url(?string $path, ?string $disk = null): string
    {
        if (!$path) {
            return '';
        }

        if (filter_var($path, FILTER_VALIDATE_URL)) {
            return $path;
        }

        $disk = $disk ?? config('filesystems.default');

        if ($disk === 'gcs') {
            $bucket = config('filesystems.disks.gcs.bucket');
            $pathPrefix = config('filesystems.disks.gcs.path_prefix', '');

            $fullPath = $pathPrefix ? trim($pathPrefix, '/') . '/' . ltrim($path, '/') : ltrim($path, '/');

            return "https://storage.googleapis.com/{$bucket}/{$fullPath}";
        }

        if ($disk === 'public') {
            $baseUrl = rtrim(config('app.url'), '/');
            return "{$baseUrl}/storage/" . ltrim($path, '/');
        }

        if ($disk === 'local') {
            $baseUrl = rtrim(config('app.url'), '/');
            return "{$baseUrl}/storage/" . ltrim($path, '/');
        }

        try {
            $diskInstance = \Illuminate\Support\Facades\Storage::disk($disk);

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
