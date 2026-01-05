<?php

namespace App\Services;

use App\Models\Setting;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class SettingService
{
    /**
     * Get current tenant ID from app container or authenticated user
     *
     * @return int
     */
    private function getCurrentTenantId(): int
    {
        return app()->bound('current_tenant_id')
            ? app('current_tenant_id')
            : Auth::user()->tenant_id;
    }

    /**
     * Get all settings grouped by category
     */
    public function getAllSettings(): array
    {
        $tenantId = $this->getCurrentTenantId();

        return [
            'general' => $this->getGroup('general', $tenantId),
            'horarios' => $this->getGroup('horarios', $tenantId),
            'whatsapp' => $this->getGroup('whatsapp', $tenantId),
            'bimestres' => $this->getGroup('bimestres', $tenantId),
        ];
    }

    /**
     * Get settings by group
     */
    public function getGroup(string $group, ?int $tenantId = null): array
    {
        $tenantId = $tenantId ?? $this->getCurrentTenantId();

        $cacheKey = "settings.{$tenantId}.{$group}";

        return Cache::remember($cacheKey, 3600, function () use ($group, $tenantId) {
            $settings = Setting::where('tenant_id', $tenantId)
                ->byGroup($group)
                ->get();

            $result = [];
            foreach ($settings as $setting) {
                $result[$setting->key] = $setting->getTypedValue();
            }

            return $result;
        });
    }

    /**
     * Get a single setting value
     */
    public function get(string $key, mixed $default = null, ?int $tenantId = null): mixed
    {
        $tenantId = $tenantId ?? $this->getCurrentTenantId();

        $cacheKey = "setting.{$tenantId}.{$key}";

        return Cache::remember($cacheKey, 3600, function () use ($key, $default, $tenantId) {
            $setting = Setting::where('tenant_id', $tenantId)
                ->byKey($key)
                ->first();

            return $setting ? $setting->getTypedValue() : $default;
        });
    }

    /**
     * Set a single setting value
     */
    public function set(string $key, mixed $value, string $type = 'string', string $group = 'general', ?int $tenantId = null): Setting
    {
        $tenantId = $tenantId ?? $this->getCurrentTenantId();

        $storedValue = match ($type) {
            'boolean' => $value ? 'true' : 'false',
            'json', 'array' => is_string($value) ? $value : json_encode($value),
            default => (string) $value,
        };

        $setting = Setting::updateOrCreate(
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

        $this->clearCache($tenantId, $key, $group);

        return $setting;
    }

    /**
     * Update multiple settings
     */
    public function updateSettings(array $settings, ?int $tenantId = null): void
    {
        $tenantId = $tenantId ?? $this->getCurrentTenantId();

        foreach ($settings as $key => $value) {
            $setting = Setting::where('tenant_id', $tenantId)
                ->byKey($key)
                ->first();

            if ($setting) {
                $this->set($key, $value, $setting->type, $setting->group, $tenantId);
            } elseif (is_array($value)) {
                // Handle nested arrays
                $this->updateSettings($value, $tenantId);
            }
        }
    }

    /**
     * Get schedule for a specific level and shift
     */
    public function getScheduleForLevel(string $level, string $shift = 'MAÑANA', ?int $tenantId = null): array
    {
        $tenantId = $tenantId ?? $this->getCurrentTenantId();
        $levelLower = strtolower($level);
        $shiftLower = strtolower($shift);

        $entryKey = "horario_{$levelLower}_{$shiftLower}_entrada";
        $exitKey = "horario_{$levelLower}_{$shiftLower}_salida";

        return [
            'entrada' => $this->get($entryKey, '08:00', $tenantId),
            'salida' => $this->get($exitKey, '13:00', $tenantId),
        ];
    }

    /**
     * Get tolerance minutes for tardiness
     */
    public function getToleranceMinutes(?int $tenantId = null): int
    {
        $tenantId = $tenantId ?? $this->getCurrentTenantId();
        return (int) $this->get('tardiness_tolerance_minutes', 5, $tenantId);
    }

    /**
     * Get WhatsApp phone number for a specific level
     */
    public function getWhatsAppPhone(string $level, ?int $tenantId = null): ?string
    {
        $tenantId = $tenantId ?? $this->getCurrentTenantId();
        $levelLower = strtolower($level);
        return $this->get("whatsapp_{$levelLower}_phone", null, $tenantId);
    }

    /**
     * Check if WhatsApp notifications are enabled
     */
    public function isWhatsAppEnabled(?int $tenantId = null): bool
    {
        $tenantId = $tenantId ?? $this->getCurrentTenantId();
        return (bool) $this->get('whatsapp_notifications_enabled', true, $tenantId);
    }

    /**
     * Get current bimester based on date
     */
    public function getCurrentBimester(?Carbon $date = null, ?int $tenantId = null): ?int
    {
        $tenantId = $tenantId ?? $this->getCurrentTenantId();
        $date = $date ?? now();

        for ($i = 1; $i <= 4; $i++) {
            $inicio = Carbon::parse($this->get("bimestre_{$i}_inicio", null, $tenantId));
            $fin = Carbon::parse($this->get("bimestre_{$i}_fin", null, $tenantId));

            if ($date->between($inicio, $fin)) {
                return $i;
            }
        }

        return null;
    }

    /**
     * Get bimester dates
     */
    public function getBimesterDates(int $bimester, ?int $tenantId = null): array
    {
        $tenantId = $tenantId ?? $this->getCurrentTenantId();

        return [
            'inicio' => $this->get("bimestre_{$bimester}_inicio", null, $tenantId),
            'fin' => $this->get("bimestre_{$bimester}_fin", null, $tenantId),
        ];
    }

    /**
     * Check if a day is an attendance day
     */
    public function isAttendanceDay(string $day, ?int $tenantId = null): bool
    {
        $tenantId = $tenantId ?? $this->getCurrentTenantId();
        $attendanceDays = $this->get('attendance_days', ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'], $tenantId);

        return in_array(strtolower($day), $attendanceDays);
    }

    /**
     * Check if auto-mark absences is enabled
     */
    public function shouldAutoMarkAbsences(?int $tenantId = null): bool
    {
        $tenantId = $tenantId ?? $this->getCurrentTenantId();
        return (bool) $this->get('auto_mark_absences', true, $tenantId);
    }

    /**
     * Get auto-mark absences time
     */
    public function getAutoMarkAbsencesTime(?int $tenantId = null): string
    {
        $tenantId = $tenantId ?? $this->getCurrentTenantId();
        return $this->get('auto_mark_absences_time', '10:00', $tenantId);
    }

    /**
     * Clear cache for specific setting
     */
    private function clearCache(?int $tenantId, string $key, string $group): void
    {
        $tenantId = $tenantId ?? $this->getCurrentTenantId();

        Cache::forget("setting.{$tenantId}.{$key}");

        Cache::forget("settings.{$tenantId}.{$group}");
    }

    /**
     * Clear all settings cache for a tenant
     */
    public function clearAllCache(?int $tenantId = null): void
    {
        $tenantId = $tenantId ?? $this->getCurrentTenantId();

        $groups = ['general', 'horarios', 'whatsapp', 'bimestres'];

        foreach ($groups as $group) {
            Cache::forget("settings.{$tenantId}.{$group}");
        }

        $settings = Setting::where('tenant_id', $tenantId)->get();
        foreach ($settings as $setting) {
            Cache::forget("setting.{$tenantId}.{$setting->key}");
        }
    }
}
