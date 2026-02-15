<?php

namespace App\Http\Controllers\Attendance;

use App\Http\Controllers\Controller;
use App\Services\AttendanceService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Exceptions\BusinessException;

class ScannerController extends Controller
{
    public function __construct(private AttendanceService $attendanceService) {}

    public function scanEntry(Request $request): JsonResponse
    {
        $request->validate([
            'qr_code' => 'required|string',
            'device_type' => 'required|string|in:SCANNER,MANUAL,CAMARA,APP',
        ]);

        try {
            $result = $this->attendanceService->scanEntry(
                $request->qr_code,
                $request->device_type
            );

            return $this->success($result, "Entrada registrada exitosamente");
        } catch (BusinessException $e) {
            return $this->error($e->getMessage(), null, 422);
        } catch (\Exception $e) {
            return $this->error('Error al registrar entrada: ' . $e->getMessage(), null, 500);
        }
    }

    public function scanExit(Request $request): JsonResponse
    {
        $request->validate([
            'qr_code' => 'required|string',
            'device_type' => 'required|string|in:SCANNER,MANUAL,CAMARA,APP',
        ]);

        try {
            $result = $this->attendanceService->scanExit(
                $request->qr_code,
                $request->device_type
            );

            return $this->success($result, "Salida registrada exitosamente");
        } catch (BusinessException $e) {
            return $this->error($e->getMessage(), null, 422);
        } catch (\Exception $e) {
            return $this->error('Error al registrar salida: ' . $e->getMessage(), null, 500);
        }
    }
}
