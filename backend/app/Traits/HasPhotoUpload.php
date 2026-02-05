<?php

namespace App\Traits;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

trait HasPhotoUpload
{
    /**
     * Upload a photo and return the storage path.
     *
     * @param UploadedFile|string|null $photo The photo file or base64 string
     * @param string $folder The folder to store the photo in (e.g., 'students', 'teachers')
     * @param string|null $oldPath The old photo path to delete
     * @return string|null The new photo path or null if no photo provided
     */
    protected function uploadPhoto(UploadedFile|string|null $photo, string $folder, ?string $oldPath = null): ?string
    {
        if (!$photo) {
            return null;
        }

        $disk = $this->getStorageDisk();

        if ($oldPath) {
            $this->deletePhoto($oldPath);
        }

        if ($photo instanceof UploadedFile) {
            $filename = $this->generateFilename($photo->getClientOriginalExtension());
            $path = $photo->storeAs($folder, $filename, $disk);
            return $path;
        }

        if (is_string($photo) && $this->isBase64Image($photo)) {
            return $this->uploadBase64Photo($photo, $folder);
        }

        if (is_string($photo)) {
            return $photo;
        }

        return null;
    }

    /**
     * Upload a base64 encoded photo.
     */
    protected function uploadBase64Photo(string $base64, string $folder): string
    {
        $disk = $this->getStorageDisk();

        if (preg_match('/^data:image\/(\w+);base64,/', $base64, $matches)) {
            $extension = $matches[1];
            $base64 = substr($base64, strpos($base64, ',') + 1);
        } else {
            $extension = 'jpg';
        }

        $imageData = base64_decode($base64);
        $filename = $this->generateFilename($extension);
        $path = "{$folder}/{$filename}";

        Storage::disk($disk)->put($path, $imageData);

        return $path;
    }

    /**
     * Delete a photo from storage.
     */
    protected function deletePhoto(?string $path): bool
    {
        if (!$path) {
            return false;
        }

        if (filter_var($path, FILTER_VALIDATE_URL)) {
            return false;
        }

        $disk = $this->getStorageDisk();

        if (Storage::disk($disk)->exists($path)) {
            return Storage::disk($disk)->delete($path);
        }

        return false;
    }

    /**
     * Check if a string is a base64 encoded image.
     */
    protected function isBase64Image(string $string): bool
    {
        return str_starts_with($string, 'data:image/');
    }

    /**
     * Generate a unique filename for the photo.
     */
    protected function generateFilename(string $extension): string
    {
        return Str::uuid() . '.' . strtolower($extension);
    }

    /**
     * Get the storage disk to use.
     */
    protected function getStorageDisk(): string
    {
        return config('filesystems.default');
    }
}
