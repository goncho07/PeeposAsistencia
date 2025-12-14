<?php

namespace App\Http\Controllers\Attendance;

use App\Http\Controllers\Controller;
use App\Services\AttendanceService;
use App\Services\ReportService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AttendanceController extends Controller
{
    public function __construct(
        private AttendanceService $attendanceService,
        private ReportService $reportService
    ) {}

    public function getDailyStats(Request $request): JsonResponse
    {
        $date = $request->query('date') ? \Carbon\Carbon::parse($request->query('date')) : now();
        $stats = $this->attendanceService->getDailyStats($date);

        return response()->json($stats);
    }

    public function generateReport(Request $request): JsonResponse
    {
        $request->validate([
            'period' => 'required|in:daily,weekly,monthly,bimester,custom',
            'type' => 'required|in:all,student,teacher',
            'from' => 'required_if:period,custom|date',
            'to' => 'required_if:period,custom|date|after_or_equal:from',
            'bimester' => 'required_if:period,bimester|integer|between:1,4',
            'nivel' => 'nullable|in:INICIAL,PRIMARIA,SECUNDARIA',
            'grado' => 'nullable|integer|between:1,6',
            'seccion' => 'nullable|string',
        ]);

        $report = $this->reportService->generateReport($request->all());

        return response()->json($report);
    }
}
