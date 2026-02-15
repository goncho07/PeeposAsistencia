<?php

namespace App\Services;

use App\Models\Student;
use App\Models\Attendance;
use App\Models\Tenant;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    private string $baseIp;
    private string $token;
    private SettingService $settingService;

    public function __construct(SettingService $settingService)
    {
        $this->baseIp = config('services.whatsapp.base_ip');
        $this->token = config('services.whatsapp.token');
        $this->settingService = $settingService;
    }

    /**
     * Get the WAHA API URL for a specific education level.
     * Each level has its own WAHA instance running on a different port.
     */
    private function getApiUrl(string $level): ?string
    {
        $port = $this->settingService->getWahaPort($level);

        if (!$port) {
            Log::warning("No hay puerto WAHA configurado para nivel: {$level}");
            return null;
        }

        return "http://{$this->baseIp}:{$port}/api";
    }

    /**
     * Send attendance notification to student's parents via WhatsApp
     *
     * @param Student $student The student whose attendance is being reported
     * @param Attendance $attendance The attendance record
     * @param string $type Type of notification: 'ENTRADA' or 'SALIDA'
     * @return bool True if at least one message was sent successfully
     */
    public function sendAttendanceNotification(Student $student, Attendance $attendance, string $type = 'ENTRADA'): bool
    {
        if (!$this->settingService->isWhatsAppEnabled()) {
            return false;
        }

        if ($type === 'ENTRADA' && !$this->settingService->shouldSendWhatsAppOnEntry()) {
            Log::info("WhatsApp deshabilitado para entradas - Estudiante: {$student->id}");
            return false;
        }

        if ($type === 'SALIDA' && !$this->settingService->shouldSendWhatsAppOnExit()) {
            Log::info("WhatsApp deshabilitado para salidas - Estudiante: {$student->id}");
            return false;
        }

        $level = $student->classroom->level ?? null;

        if (!$level) {
            Log::warning("Estudiante {$student->id} sin aula o nivel asignado, no se puede enviar WhatsApp");
            return false;
        }

        $apiUrl = $this->getApiUrl($level);

        if (!$apiUrl) {
            return false;
        }

        $parents = $this->getPrimaryParents($student);

        if ($parents->isEmpty()) {
            Log::warning("Estudiante {$student->id} no tiene padres o tutores primarios registrados");
            return false;
        }

        $tenant = app()->bound('current_tenant') ? app('current_tenant') : null;
        $message = $this->buildMessage($student, $attendance, $type, $tenant);

        $sentCount = $this->sendToParents($parents, $message, $apiUrl, $student->id);

        if ($sentCount > 0) {
            $attendance->update(['whatsapp_sent' => true]);
            return true;
        }

        return false;
    }

    /**
     * Send absence notification to student's parents via WhatsApp
     *
     * @param Student $student The student who is absent
     * @param Attendance $attendance The attendance record
     * @return bool True if at least one message was sent successfully
     */
    public function sendAbsenceNotification(Student $student, Attendance $attendance): bool
    {
        if (!$this->settingService->isWhatsAppEnabled()) {
            return false;
        }

        if (!$this->settingService->shouldSendWhatsAppOnAbsence()) {
            Log::info("WhatsApp deshabilitado para ausencias - Estudiante: {$student->id}");
            return false;
        }

        $level = $student->classroom->level ?? null;

        if (!$level) {
            Log::warning("Estudiante {$student->id} sin aula o nivel asignado, no se puede enviar WhatsApp");
            return false;
        }

        $apiUrl = $this->getApiUrl($level);

        if (!$apiUrl) {
            return false;
        }

        $parents = $this->getPrimaryParents($student);

        if ($parents->isEmpty()) {
            Log::warning("Estudiante {$student->id} no tiene padres o tutores registrados");
            return false;
        }

        $tenant = app()->bound('current_tenant') ? app('current_tenant') : null;
        $message = $this->buildAbsenceMessage($student, $attendance, $tenant);

        $sentCount = $this->sendToParents($parents, $message, $apiUrl, $student->id);

        if ($sentCount > 0) {
            $attendance->update(['whatsapp_sent' => true]);
            return true;
        }

        return false;
    }

    /**
     * Get primary contact parents, fallback to all parents
     */
    private function getPrimaryParents(Student $student)
    {
        $parents = $student->parents()->wherePivot('is_primary_contact', true)->get();

        if ($parents->isEmpty()) {
            $parents = $student->parents;
        }

        return $parents;
    }

    /**
     * Send a message to all parents via WAHA
     *
     * @return int Number of successfully sent messages
     */
    private function sendToParents($parents, string $message, string $apiUrl, int $studentId): int
    {
        $sentCount = 0;

        foreach ($parents as $parent) {
            if (!$parent->phone_number) {
                continue;
            }

            $phone = $this->formatPhone($parent->phone_number);

            try {
                $response = Http::withHeaders([
                    'X-Api-Key' => $this->token,
                ])->post("{$apiUrl}/sendText", [
                    'chatId' => $phone,
                    'text' => $message,
                    'session' => 'default',
                ]);

                if ($response->successful()) {
                    $sentCount++;
                } else {
                    Log::error('Error WAHA', [
                        'url' => $apiUrl,
                        'res' => $response->body(),
                        'student_id' => $studentId,
                        'parent_id' => $parent->id,
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Excepción enviando WhatsApp', [
                    'error' => $e->getMessage(),
                    'url' => $apiUrl,
                    'student_id' => $studentId,
                    'parent_id' => $parent->id,
                ]);
            }
        }

        return $sentCount;
    }

    /**
     * Build WhatsApp message text for attendance notification
     */
    private function buildMessage(Student $student, Attendance $attendance, string $type, ?Tenant $tenant): string
    {
        $nombreEstudiante = $student->full_name;
        $aula = $student->classroom->full_name ?? 'Sin aula';
        $fecha = $attendance->date->format('d/m/Y');
        $colegio = $tenant ? "*{$tenant->name}*" : '*Institución Educativa*';

        if ($type === 'ENTRADA') {
            $hora = $attendance->entry_time ? $attendance->entry_time->format('h:i A') : 'N/A';
            $status = $attendance->entry_status;

            return match ($status) {
                'ASISTIO' => "✅ *INGRESO REGISTRADO*\n\n" .
                    "👤 Alumno: *{$nombreEstudiante}*\n" .
                    "🏫 Aula: *{$aula}*\n" .
                    "🕒 Hora: *{$hora}*\n" .
                    "📅 Fecha: *{$fecha}*\n\n" .
                    "{$colegio}",

                'TARDANZA' => "⚠ *INGRESO CON TARDANZA*\n\n" .
                    "👤 Alumno: *{$nombreEstudiante}*\n" .
                    "🏫 Aula: *{$aula}*\n" .
                    "🕒 Hora: *{$hora}*\n" .
                    "📅 Fecha: *{$fecha}*\n\n" .
                    "{$colegio}",

                default => "📝 *ASISTENCIA REGISTRADA*\n\n" .
                    "👤 Alumno: *{$nombreEstudiante}*\n" .
                    "🏫 Aula: *{$aula}*\n" .
                    "🕒 Hora: *{$hora}*\n" .
                    "📅 Fecha: *{$fecha}*\n\n" .
                    "{$colegio}",
            };
        } else {
            $hora = $attendance->exit_time ? $attendance->exit_time->format('h:i A') : 'N/A';
            $status = $attendance->exit_status;

            return match ($status) {
                'COMPLETO' => "🏠 *SALIDA DEL COLEGIO*\n\n" .
                    "👤 Alumno: *{$nombreEstudiante}*\n" .
                    "🏫 Aula: *{$aula}*\n" .
                    "🕒 Hora: *{$hora}*\n" .
                    "📅 Fecha: *{$fecha}*\n\n" .
                    "{$colegio}",

                'SALIDA_ANTICIPADA' => "⚠ *SALIDA ANTICIPADA*\n\n" .
                    "👤 Alumno: *{$nombreEstudiante}*\n" .
                    "🏫 Aula: *{$aula}*\n" .
                    "🕒 Hora: *{$hora}*\n" .
                    "📅 Fecha: *{$fecha}*\n\n" .
                    "{$colegio}",

                default => "📤 *SALIDA REGISTRADA*\n\n" .
                    "👤 Alumno: *{$nombreEstudiante}*\n" .
                    "🏫 Aula: *{$aula}*\n" .
                    "🕒 Hora: *{$hora}*\n" .
                    "📅 Fecha: *{$fecha}*\n\n" .
                    "{$colegio}",
            };
        }
    }

    /**
     * Build WhatsApp message text for absence notification
     */
    private function buildAbsenceMessage(Student $student, Attendance $attendance, ?Tenant $tenant): string
    {
        $nombreEstudiante = $student->full_name;
        $aula = $student->classroom->full_name ?? 'Sin aula';
        $fecha = $attendance->date->format('d/m/Y');
        $colegio = $tenant ? "*{$tenant->name}*" : '*Institución Educativa*';

        return "❌ *FALTA REGISTRADA*\n\n" .
            "👤 Alumno: *{$nombreEstudiante}*\n" .
            "🏫 Aula: *{$aula}*\n" .
            "📅 Fecha: *{$fecha}*\n\n" .
            "⚠️ El alumno no registró ingreso al colegio.\n\n" .
            "{$colegio}";
    }

    /**
     * Format phone number for WhatsApp API
     * Removes non-numeric characters and adds Peru country code (51) if needed
     */
    private function formatPhone(string $phone): string
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);

        if (!str_starts_with($phone, '51') && strlen($phone) === 9) {
            $phone = '51' . $phone;
        }

        return $phone . '@c.us';
    }
}
