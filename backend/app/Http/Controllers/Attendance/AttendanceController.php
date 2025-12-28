<?php

namespace App\Http\Controllers\Attendance;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Services\AttendanceService;
use App\Services\ReportService;
use App\Http\Resources\AttendanceResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    public function __construct(
        private AttendanceService $attendanceService,
        private ReportService $reportService
    ) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $query = Attendance::with(['attendable']);

            if ($request->query('date')) {
                $query->forDate(Carbon::parse($request->query('date')));
            }

            if ($request->query('type')) {
                if ($request->query('type') === 'student') {
                    $query->students();
                } elseif ($request->query('type') === 'teacher') {
                    $query->teachers();
                }
            }

            if ($request->query('shift')) {
                $query->byShift($request->query('shift'));
            }

            if ($request->query('status')) {
                $query->byStatus($request->query('status'));
            }

            $attendances = $query->latest('date')->latest('entry_time')->paginate(20);

            return $this->success(AttendanceResource::collection($attendances)->response()->getData(true));
        } catch (\Exception $e) {
            return $this->error('Error al obtener asistencias: ' . $e->getMessage(), null, 500);
        }
    }

    public function getDailyStats(Request $request): JsonResponse
    {
        try {
            $date = $request->query('date') ? Carbon::parse($request->query('date')) : now();
            $stats = $this->attendanceService->getDailyStats($date);

            return $this->success($stats);
        } catch (\Exception $e) {
            return $this->error('Error al obtener estadísticas: ' . $e->getMessage(), null, 500);
        }
    }

    public function generateReport(Request $request): JsonResponse
    {
        $request->validate([
            'period' => 'required|in:daily,weekly,monthly,bimester,custom',
            'type' => 'required|in:all,student,teacher',
            'from' => 'required_if:period,custom|date',
            'to' => 'required_if:period,custom|date|after_or_equal:from',
            'bimester' => 'required_if:period,bimester|integer|between:1,4',
            'level' => 'nullable|in:INICIAL,PRIMARIA,SECUNDARIA',
            'grade' => 'nullable|integer|between:1,6',
            'section' => 'nullable|string',
            'shift' => 'nullable|in:MAÑANA,TARDE,NOCHE',
        ]);

        try {
            $report = $this->reportService->generateReport($request->all());

            return $this->success($report);
        } catch (\Exception $e) {
            return $this->error('Error al generar reporte: ' . $e->getMessage(), null, 500);
        }
    }
}
