<?php

namespace App\Http\Controllers\Attendance;

use App\Http\Controllers\Controller;
use App\Services\AttendanceService;
use App\Services\ReportService;
use App\Http\Resources\AttendanceResource;
use App\Exceptions\BusinessException;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    public function __construct(
        private AttendanceService $attendanceService,
        private ReportService $reportService
    ) {}

    /**
     * Display a listing of attendances.
     *
     * GET /api/attendance
     * GET /api/attendance?date=2026-02-12
     * GET /api/attendance?type=student
     * GET /api/attendance?shift=MAÑANA
     * GET /api/attendance?status=TARDANZA
     * GET /api/attendance?per_page=50
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $date = $request->query('date');
            $type = $request->query('type');
            $shift = $request->query('shift');
            $status = $request->query('status');
            $perPage = $request->query('per_page');

            $attendances = $this->attendanceService->getAllAttendances(
                $date,
                $type,
                $shift,
                $status,
                $perPage
            );

            return $this->success(AttendanceResource::collection($attendances)->response()->getData(true));
        } catch (BusinessException $e) {
            return $this->error($e->getMessage(), null, 422);
        } catch (\Exception $e) {
            return $this->error('Error al obtener asistencias: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get personal attendance data for the authenticated user.
     *
     * GET /api/attendance/my-attendance
     */
    public function myAttendance(Request $request): JsonResponse
    {
        try {
            $data = $this->attendanceService->getMyAttendance($request->user());

            return $this->success($data);
        } catch (\Exception $e) {
            return $this->error('Error al obtener tu asistencia: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get daily attendance statistics.
     *
     * GET /api/attendance/daily-stats
     * GET /api/attendance/daily-stats?date=2026-02-12
     */
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

    /**
     * Get weekly attendance statistics (Mon-Fri).
     *
     * GET /api/attendance/weekly-stats
     * GET /api/attendance/weekly-stats?date=2026-02-12
     */
    public function getWeeklyStats(Request $request): JsonResponse
    {
        try {
            $date = $request->query('date') ? Carbon::parse($request->query('date')) : now();
            $stats = $this->attendanceService->getWeeklyStats($date);

            return $this->success($stats);
        } catch (\Exception $e) {
            return $this->error('Error al obtener estadísticas semanales: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Generate an attendance report.
     *
     * POST /api/attendance/report
     */
    public function generateReport(Request $request): JsonResponse
    {
        $request->validate([
            'period' => 'required|in:daily,weekly,monthly,bimester,custom',
            'type' => 'required|in:student,teacher,user',
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

    /**
     * Get attendance stats for a specific classroom's students.
     *
     * GET /api/attendance/classroom/{classroomId}/stats
     * GET /api/attendance/classroom/{classroomId}/stats?from=2026-02-01&to=2026-02-14
     */
    public function classroomStats(Request $request, int $classroomId): JsonResponse
    {
        try {
            $from = $request->query('from') ? Carbon::parse($request->query('from')) : null;
            $to = $request->query('to') ? Carbon::parse($request->query('to')) : null;

            $stats = $this->attendanceService->getClassroomAttendanceStats($classroomId, $from, $to);

            return $this->success($stats);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->error('Aula no encontrada', null, 404);
        } catch (\Exception $e) {
            return $this->error('Error al obtener estadísticas del aula: ' . $e->getMessage(), null, 500);
        }
    }
}
