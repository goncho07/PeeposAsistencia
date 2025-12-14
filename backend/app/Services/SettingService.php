<?php

namespace App\Services;

use App\Models\Ajuste;
use Carbon\Carbon;

class SettingService
{
    public function getAllSettings(): array
    {
        return [
            'general' => Ajuste::getGroup('general'),
            'horarios' => Ajuste::getGroup('horarios'),
            'whatsapp' => Ajuste::getGroup('whatsapp'),
            'bimestres' => Ajuste::getGroup('bimestres'),
        ];
    }

    public function updateSettings(array $settings): void
    {
        foreach ($settings as $key => $value) {
            $setting = Ajuste::where('key', $key)->first();

            if ($setting) {
                Ajuste::set($key, $value, $setting->type, $setting->group);
            }
        
            elseif (is_array($value)) {
                $this->updateSettings($value);
            }
        }
    }

    public function getScheduleForLevel(string $nivel): array
    {
        $nivelLower = strtolower($nivel);

        return [
            'entrada' => Ajuste::get("horario_{$nivelLower}_entrada", '08:00'),
            'salida' => Ajuste::get("horario_{$nivelLower}_salida", '13:00'),
        ];
    }

    public function getToleranceMinutes(): int
    {
        return Ajuste::get('tardiness_tolerance_minutes', 5);
    }

    public function getWhatsAppPhone(string $nivel): ?string
    {
        $nivelLower = strtolower($nivel);
        return Ajuste::get("whatsapp_{$nivelLower}_phone");
    }

    public function isWhatsAppEnabled(): bool
    {
        return Ajuste::get('whatsapp_notifications_enabled', true);
    }

    public function getCurrentBimester(?Carbon $date = null): ?int
    {
        $date = $date ?? now();

        for ($i = 1; $i <= 4; $i++) {
            $inicio = Carbon::parse(Ajuste::get("bimestre_{$i}_inicio"));
            $fin = Carbon::parse(Ajuste::get("bimestre_{$i}_fin"));

            if ($date->between($inicio, $fin)) {
                return $i;
            }
        }

        return null;
    }

    public function getBimesterDates(int $bimester): array
    {
        return [
            'inicio' => Ajuste::get("bimestre_{$bimester}_inicio"),
            'fin' => Ajuste::get("bimestre_{$bimester}_fin"),
        ];
    }

    public function isAttendanceDay(string $day): bool
    {
        $attendanceDays = Ajuste::get('attendance_days', ['lunes', 'martes', 'miercoles', 'jueves', 'viernes']);
        return in_array(strtolower($day), $attendanceDays);
    }
}
