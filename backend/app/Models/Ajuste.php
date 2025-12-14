<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Ajuste extends Model
{
    protected $fillable = ['key', 'value', 'type', 'group'];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Obtener valor con cache
     */
    public static function get(string $key, $default = null)
    {
        return Cache::remember("ajuste.{$key}", 3600, function () use ($key, $default) {
            $setting = self::where('key', $key)->first();

            if (!$setting) {
                return $default;
            }

            return self::castValue($setting->value, $setting->type);
        });
    }

    /**
     * Establecer valor y limpiar cache
     */
    /**
     * Establecer valor y limpiar cache (INDIVIDUAL Y GRUPAL)
     */
    public static function set(string $key, $value, string $type = 'string', string $group = 'general'): void
    {
        // Handle array to JSON conversion automatically
        $valueString = is_array($value) ? json_encode($value) : (string) $value;

        self::updateOrCreate(
            ['key' => $key],
            [
                'value' => $valueString,
                'type' => $type,
                'group' => $group
            ]
        );

        // 1. Clear the individual cache
        Cache::forget("ajuste.{$key}");

        // 2. CRITICAL: Clear the group cache so lists update immediately
        Cache::forget("ajuste.group.{$group}");
    }

    /**
     * Obtener todas las configuraciones de un grupo
     */
    public static function getGroup(string $group): array
    {
        return Cache::remember("ajuste.group.{$group}", 3600, function () use ($group) {
            return self::where('group', $group)
                ->get()
                ->mapWithKeys(function ($setting) {
                    return [$setting->key => self::castValue($setting->value, $setting->type)];
                })
                ->toArray();
        });
    }

    /**
     * Castear valor según tipo
     */
    private static function castValue($value, string $type)
    {
        return match ($type) {
            'integer' => (int) $value,
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'json' => json_decode($value, true),
            default => $value,
        };
    }

    /**
     * Limpiar todo el cache de ajustes
     */
    public static function clearCache(): void
    {
        Cache::flush(); // O usar tags si tu driver lo soporta
    }
}
