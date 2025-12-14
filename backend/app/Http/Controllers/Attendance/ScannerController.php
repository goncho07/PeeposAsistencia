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
        ]);

        try {
            $result = $this->attendanceService->scanEntry(
                $request->qr_code,
                $request->user()->id
            );

            return response()->json($result);
        } catch (BusinessException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function scanExit(Request $request): JsonResponse
    {
        $request->validate([
            'qr_code' => 'required|string',
        ]);

        try {
            $result = $this->attendanceService->scanExit(
                $request->qr_code,
                $request->user()->id
            );

            return response()->json($result);
        } catch (BusinessException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}