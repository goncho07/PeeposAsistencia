<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class FaceEmbedding extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'embeddable_type',
        'embeddable_id',
        'external_id',
        'status',
        'error_message',
        'source_image_url',
        'enrolled_at',
    ];

    protected $casts = [
        'enrolled_at' => 'datetime',
    ];

    public const STATUS_ACTIVE = 'ACTIVE';
    public const STATUS_PENDING = 'PENDING';
    public const STATUS_FAILED = 'FAILED';
    public const STATUS_NO_FACE = 'NO_FACE';

    public function embeddable(): MorphTo
    {
        return $this->morphTo();
    }

    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    public function scopeForTenant($query, int $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    public function scopeNeedsRetry($query, int $hoursOld = 24)
    {
        return $query->where('status', self::STATUS_FAILED)
            ->where('updated_at', '<', now()->subHours($hoursOld));
    }

    public function markAsActive(): void
    {
        $this->update([
            'status' => self::STATUS_ACTIVE,
            'enrolled_at' => now(),
            'error_message' => null,
        ]);
    }

    public function markAsFailed(string $error): void
    {
        $this->update([
            'status' => self::STATUS_FAILED,
            'error_message' => $error,
        ]);
    }

    public function markAsNoFace(): void
    {
        $this->update([
            'status' => self::STATUS_NO_FACE,
            'error_message' => 'No face detected in the image',
        ]);
    }

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    public static function generateExternalId(string $type, int $id): string
    {
        $prefix = match ($type) {
            'App\\Models\\Student', 'student' => 'student',
            'App\\Models\\Teacher', 'teacher' => 'teacher',
            default => strtolower(class_basename($type)),
        };

        return "{$prefix}_{$id}";
    }

    public static function parseExternalId(string $externalId): ?array
    {
        if (!preg_match('/^(student|teacher)_(\d+)$/', $externalId, $matches)) {
            return null;
        }

        $type = match ($matches[1]) {
            'student' => Student::class,
            'teacher' => Teacher::class,
            default => null,
        };

        return $type ? [
            'type' => $type,
            'id' => (int) $matches[2],
        ] : null;
    }
}
