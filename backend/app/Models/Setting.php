<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class Setting extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'key',
        'value',
        'type',
        'group',
        'description',
    ];

    public function scopeByGroup($query, $group)
    {
        return $query->where('group', $group);
    }

    public function scopeByKey($query, $key)
    {
        return $query->where('key', $key);
    }

    public function getTypedValue()
    {
        return match ($this->type) {
            'boolean' => filter_var($this->value, FILTER_VALIDATE_BOOLEAN),
            'integer' => (int) $this->value,
            'float', 'decimal' => (float) $this->value,
            'json' => json_decode($this->value, true),
            'array' => json_decode($this->value, true),
            default => $this->value,
        };
    }


    public function setTypedValue(mixed $value): void
    {
        $this->value = match ($this->type) {
            'boolean' => $value ? 'true' : 'false',
            'json', 'array' => is_string($value) ? $value : json_encode($value),
            default => (string) $value,
        };
    }

    public static function getValue(string $key, mixed $default = null): mixed
    {
        $tenantId = Auth::user()?->tenant_id;

        if (!$tenantId) {
            return $default;
        }

        $setting = static::where('tenant_id', $tenantId)
            ->where('key', $key)
            ->first();

        return $setting ? $setting->getTypedValue() : $default;
    }

    public static function setValue(string $key, mixed $value, string $type = 'string', string $group = 'general'): ?self
    {
        $tenantId = Auth::user()?->tenant_id;

        if (!$tenantId) {
            return null;
        }

        $storedValue = match ($type) {
            'boolean' => $value ? 'true' : 'false',
            'json', 'array' => is_string($value) ? $value : json_encode($value),
            default => (string) $value,
        };

        return static::updateOrCreate(
            [
                'tenant_id' => $tenantId,
                'key' => $key,
            ],
            [
                'value' => $storedValue,
                'type' => $type,
                'group' => $group,
            ]
        );
    }

    public static function getByGroup(string $group): array
    {
        $tenantId = Auth::user()?->tenant_id;

        if (!$tenantId) {
            return [];
        }

        $settings = static::where('tenant_id', $tenantId)
            ->where('group', $group)
            ->get();

        $result = [];
        foreach ($settings as $setting) {
            $result[$setting->key] = $setting->getTypedValue();
        }

        return $result;
    }
}
