<?php

namespace App\Http\Controllers;

use App\Services\SettingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class WhatsAppController extends Controller
{
    private string $baseIp;
    private string $token;
    private SettingService $settingService;

    private const LEVELS = ['inicial', 'primaria', 'secundaria'];

    public function __construct(SettingService $settingService)
    {
        $this->baseIp = config('services.whatsapp.base_ip');
        $this->token = config('services.whatsapp.token');
        $this->settingService = $settingService;
    }

    /**
     * Get WAHA instance status for all levels of a tenant.
     *
     * GET /api/superadmin/tenants/{id}/whatsapp/status
     */
    public function status(int $id): JsonResponse
    {
        $statuses = [];

        foreach (self::LEVELS as $level) {
            $port = $this->settingService->getWahaPort($level, $id);

            if (!$port) {
                $statuses[] = [
                    'level' => $level,
                    'port' => null,
                    'status' => 'NO_PORT',
                    'phone' => null,
                ];
                continue;
            }

            $statuses[] = $this->getInstanceStatus($level, $port);
        }

        return response()->json(['data' => $statuses]);
    }

    /**
     * Get QR code for a specific level's WAHA instance.
     *
     * GET /api/superadmin/tenants/{id}/whatsapp/qr/{level}
     */
    public function qr(int $id, string $level): JsonResponse
    {
        $level = strtolower($level);

        if (!in_array($level, self::LEVELS)) {
            return response()->json(['message' => 'Nivel inválido'], 422);
        }

        $port = $this->settingService->getWahaPort($level, $id);

        if (!$port) {
            return response()->json(['message' => 'No hay puerto configurado para este nivel'], 404);
        }

        $apiUrl = "http://{$this->baseIp}:{$port}/api";

        try {
            $response = Http::withHeaders([
                'X-Api-Key' => $this->token,
                'Accept' => 'image/png',
            ])->timeout(15)->get("{$apiUrl}/default/auth/qr", [
                'format' => 'image',
            ]);

            if ($response->successful()) {
                $base64 = base64_encode($response->body());

                return response()->json([
                    'data' => [
                        'qr' => "data:image/png;base64,{$base64}",
                    ],
                ]);
            }

            return response()->json([
                'message' => 'No se pudo obtener el QR. La sesión puede estar ya conectada.',
            ], $response->status());
        } catch (\Exception $e) {
            Log::error('Error obteniendo QR de WAHA', [
                'level' => $level,
                'port' => $port,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'No se pudo conectar con la instancia WAHA',
            ], 503);
        }
    }

    /**
     * Send a test message through a specific level's WAHA instance.
     *
     * POST /api/superadmin/tenants/{id}/whatsapp/test
     */
    public function sendTest(int $id, Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'level' => 'required|string|in:inicial,primaria,secundaria',
            'phone' => 'required|string|min:9|max:15',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Datos inválidos', 'errors' => $validator->errors()], 422);
        }

        $level = strtolower($request->level);
        $phone = preg_replace('/[^0-9]/', '', $request->phone);
        $port = $this->settingService->getWahaPort($level, $id);

        if (!$port) {
            return response()->json(['message' => 'No hay puerto configurado para este nivel'], 404);
        }

        if (!str_starts_with($phone, '51') && strlen($phone) === 9) {
            $phone = '51' . $phone;
        }

        $apiUrl = "http://{$this->baseIp}:{$port}/api";

        try {
            $response = Http::withHeaders([
                'X-Api-Key' => $this->token,
            ])->timeout(15)->post("{$apiUrl}/sendText", [
                'chatId' => "{$phone}@c.us",
                'text' => "✅ *MENSAJE DE PRUEBA*\n\nEste es un mensaje de prueba del sistema de notificaciones WhatsApp.\n\nNivel: *" . ucfirst($level) . "*\nPuerto: *{$port}*",
                'session' => 'default',
            ]);

            if ($response->successful()) {
                return response()->json(['message' => 'Mensaje de prueba enviado correctamente']);
            }

            Log::error('Error enviando test WAHA', [
                'level' => $level,
                'port' => $port,
                'response' => $response->body(),
            ]);

            return response()->json([
                'message' => 'Error al enviar el mensaje. Verifica que la sesión esté conectada.',
            ], 422);
        } catch (\Exception $e) {
            Log::error('Excepción enviando test WAHA', [
                'level' => $level,
                'port' => $port,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'No se pudo conectar con la instancia WAHA',
            ], 503);
        }
    }

    /**
     * Update the WAHA port for a specific level.
     *
     * POST /api/superadmin/tenants/{id}/whatsapp/port
     */
    public function updatePort(int $id, Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'level' => 'required|string|in:inicial,primaria,secundaria',
            'port' => 'required|integer|min:1000|max:65535',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Datos inválidos', 'errors' => $validator->errors()], 422);
        }

        $level = strtolower($request->level);
        $port = $request->port;

        $this->settingService->set(
            "waha_{$level}_port",
            $port,
            'integer',
            'whatsapp',
            $id
        );

        return response()->json(['message' => "Puerto de {$level} actualizado a {$port}"]);
    }

    /**
     * Get status of a single WAHA instance
     */
    private function getInstanceStatus(string $level, int $port): array
    {
        $apiUrl = "http://{$this->baseIp}:{$port}/api";

        try {
            $response = Http::withHeaders([
                'X-Api-Key' => $this->token,
            ])->timeout(20)->get("{$apiUrl}/sessions/default");

            if (!$response->successful()) {
                return [
                    'level' => $level,
                    'port' => $port,
                    'status' => 'ERROR',
                    'phone' => null,
                ];
            }

            $data = $response->json();
            $wahaStatus = $data['status'] ?? 'UNKNOWN';

            $status = match ($wahaStatus) {
                'WORKING' => 'CONNECTED',
                'SCAN_QR_CODE' => 'QR',
                'STARTING', 'STOPPED' => 'DISCONNECTED',
                default => 'DISCONNECTED',
            };

            $phone = null;
            if ($status === 'CONNECTED') {
                $meData = $data['me'] ?? null;
                if ($meData && isset($meData['id'])) {
                    $phone = str_replace('@c.us', '', $meData['id']);
                }
            }

            return [
                'level' => $level,
                'port' => $port,
                'status' => $status,
                'phone' => $phone,
            ];
        } catch (\Exception $e) {
            Log::warning("Error conectando a WAHA instancia {$level}:{$port}", [
                'error' => $e->getMessage(),
            ]);

            return [
                'level' => $level,
                'port' => $port,
                'status' => 'ERROR',
                'phone' => null,
            ];
        }
    }
}
