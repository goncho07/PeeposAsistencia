<?php

namespace App\Services;

use App\Models\Estudiante;
use App\Models\Asistencia;
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

    public function sendAttendanceNotification(Estudiante $estudiante, Asistencia $asistencia, string $type = 'ENTRADA'): bool
    {
        if (!$this->settingService->isWhatsAppEnabled()) {
            return false;
        }

        if (!$estudiante->padre || !$estudiante->padre->phone_number) {
            Log::warning("Estudiante {$estudiante->id} no tiene padre o teléfono registrado");
            return false;
        }

        //$phone = $this->settingService->getWhatsAppPhone($estudiante->aula->nivel);
        $phone = $this->formatPhone($estudiante->padre->phone_number);

         /*if (!$phone) {
            Log::warning("No hay teléfono WhatsApp configurado para nivel {$estudiante->aula->nivel}");
            return false;
        }*/

        $message = $this->buildMessage($estudiante, $asistencia, $type);

        try {
            $response = Http::get("{$this->apiUrl}/send-text", [
                'token' => $this->token,
                'instance_id' => $this->instanceId,
                'jid' => $phone,
                'msg' => $message,
            ]);

            $body = $response->json();

            if (isset($body['success']) && $body['success'] === true) {
                $asistencia->update([
                    'whatsapp_sent' => true,
                    'whatsapp_sent_at' => now(),
                ]);
                return true;
            }

            Log::error('Error enviando WhatsApp', [
                'response' => $body,
                'estudiante_id' => $estudiante->id,
            ]); 

            return false;
        } catch (\Exception $e) {
            Log::error('Excepción enviando WhatsApp', [
                'error' => $e->getMessage(),
                'estudiante_id' => $estudiante->id,
            ]);

            return false;
        }
    }

    private function buildMessage(Estudiante $estudiante, Asistencia $asistencia, string $type): string
    {
        $nombreEstudiante = $estudiante->full_name;
        $aula = $estudiante->aula->nombre_completo;
        $fecha = $asistencia->date->format('d/m/Y');
        $colegio = '*I.E.E 6049 Ricardo Palma*';

        if ($type === 'ENTRADA') {
            $hora = $asistencia->entry_time ? $asistencia->entry_time->format('h:i A') : 'N/A';
            $status = $asistencia->entry_status;

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
            $hora = $asistencia->exit_time ? $asistencia->exit_time->format('h:i A') : 'N/A';
            $status = $asistencia->exit_status;

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
