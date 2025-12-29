<?php

namespace App\Services;

use App\Models\Student;
use App\Models\Attendance;
use App\Models\Tenant;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    private string $apiUrl;
    private string $token;
    private string $instanceId;
    private SettingService $settingService;

    public function __construct(SettingService $settingService)
    {
        $this->apiUrl = config('services.whatsapp.api_url') ?? 'https://wapiapp.com/api/v1';
        $this->token = config('services.whatsapp.token') ?? '';
        $this->instanceId = config('services.whatsapp.instance_id') ?? '';
        $this->settingService = $settingService;
    }

    public function sendAttendanceNotification(Student $student, Attendance $attendance, string $type = 'ENTRADA'): bool
    {
        $tenantId = Auth::user()->tenant_id;

        if (!$this->settingService->isWhatsAppEnabled($tenantId)) {
            return false;
        }

        $parents = $student->parents()->wherePivot('is_primary_contact', true)->get();

        if ($parents->isEmpty()) {
            $parents = $student->parents;
        }

        if ($parents->isEmpty()) {
            Log::warning("Estudiante {$student->id} no tiene padres o tutores registrados");
            return false;
        }

        $tenant = Auth::user()->tenant;
        $message = $this->buildMessage($student, $attendance, $type, $tenant);
        $sentCount = 0;

        foreach ($parents as $parent) {
            if (!$parent->phone_number) {
                continue;
            }

            $phone = $this->formatPhone($parent->phone_number);

            try {
                $response = Http::get("{$this->apiUrl}/send-text", [
                    'token' => $this->token,
                    'instance_id' => $this->instanceId,
                    'jid' => $phone,
                    'msg' => $message,
                ]);

                $body = $response->json();

                if (isset($body['success']) && $body['success'] === true) {
                    $sentCount++;
                } else {
                    Log::error('Error enviando WhatsApp', [
                        'response' => $body,
                        'student_id' => $student->id,
                        'parent_id' => $parent->id,
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Excepción enviando WhatsApp', [
                    'error' => $e->getMessage(),
                    'student_id' => $student->id,
                    'parent_id' => $parent->id,
                ]);
            }
        }

        if ($sentCount > 0) {
            $attendance->update([
                'whatsapp_sent' => true,
            ]);
            return true;
        }

        return false;
    }

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

    private function formatPhone(string $phone): string
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);

        if (!str_starts_with($phone, '51') && strlen($phone) === 9) {
            $phone = '51' . $phone;
        }

        return $phone . '@s.whatsapp.net';
    }
}
