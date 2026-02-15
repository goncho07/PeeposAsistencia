<?php

namespace App\Services;

use App\Models\Setting;
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
        ];
    }

    /**
     * Get settings by group
     */
    public function getGroup(string $group, ?int $tenantId = null): array
    {
        $tenantId = $tenantId ?? $this->getCurrentTenantId();

        $cacheKey = "settings.{$tenantId}.{$group}";

        return Cache::remember($cacheKey, 3600, function () use ($group) {
            $settings = Setting::byGroup($group)->get();

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

        return Cache::remember($cacheKey, 3600, function () use ($key, $default) {
            $setting = Setting::byKey($key)->first();

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
            $setting = Setting::byKey($key)->first();

            if ($setting) {
                $this->set($key, $value, $setting->type, $setting->group, $tenantId);
            } elseif (is_array($value)) {
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
     * Get WAHA instance port for a specific education level
     */
    public function getWahaPort(string $level, ?int $tenantId = null): ?int
    {
        $tenantId = $tenantId ?? $this->getCurrentTenantId();
        $levelLower = strtolower($level);
        $port = $this->get("waha_{$levelLower}_port", null, $tenantId);

        return $port ? (int) $port : null;
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
     * Check if WhatsApp notifications should be sent on entry
     */
    public function shouldSendWhatsAppOnEntry(?int $tenantId = null): bool
    {
        $tenantId = $tenantId ?? $this->getCurrentTenantId();
        return (bool) $this->get('whatsapp_send_on_entry', true, $tenantId);
    }

    /**
     * Check if WhatsApp notifications should be sent on exit
     */
    public function shouldSendWhatsAppOnExit(?int $tenantId = null): bool
    {
        $tenantId = $tenantId ?? $this->getCurrentTenantId();
        return (bool) $this->get('whatsapp_send_on_exit', false, $tenantId);
    }

    /**
     * Check if WhatsApp notifications should be sent on absence
     */
    public function shouldSendWhatsAppOnAbsence(?int $tenantId = null): bool
    {
        $tenantId = $tenantId ?? $this->getCurrentTenantId();
        return (bool) $this->get('whatsapp_send_on_absence', true, $tenantId);
    }

    /**
     * Get allowed attendable types for the tenant.
     * Returns array of model classes that can be scanned for attendance.
     *
     * @return string[] Array of short type names: 'student', 'teacher', 'user'
     */
    public function getAttendableTypes(?int $tenantId = null): array
    {
        $tenantId = $tenantId ?? $this->getCurrentTenantId();
        $types = $this->get('attendable_types', ['student'], $tenantId);

        return is_array($types) ? $types : ['student'];
    }

    /**
     * Get allowed attendable model classes for the tenant.
     *
     * @return string[] Array of fully qualified class names
     */
    public function getAttendableModelClasses(?int $tenantId = null): array
    {
        $typeMap = [
            'student' => \App\Models\Student::class,
            'teacher' => \App\Models\Teacher::class,
            'user' => \App\Models\User::class,
        ];

        $allowed = $this->getAttendableTypes($tenantId);

        return array_values(array_intersect_key($typeMap, array_flip($allowed)));
    }

    /**
     * Check if a specific attendable type is allowed for the tenant.
     */
    public function isAttendableTypeAllowed(string $type, ?int $tenantId = null): bool
    {
        return in_array($type, $this->getAttendableTypes($tenantId));
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

        $groups = ['general', 'horarios', 'whatsapp'];

        foreach ($groups as $group) {
            Cache::forget("settings.{$tenantId}.{$group}");
        }

        Setting::all()->each(function ($setting) use ($tenantId) {
            Cache::forget("setting.{$tenantId}.{$setting->key}");
        });
    }
}
