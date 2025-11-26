<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AttendanceRecord;
use App\Models\User;
use App\Models\Notification;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function stats()
    {
        $today = Carbon::today();

        // 1. Asistencia Hoy
        $totalStudents = User::where('role', 'student')->where('status', 'active')->count();
        $presentCount = AttendanceRecord::whereDate('date', $today)
                                        ->where('status', 'present')
                                        ->count();
        
        $attendancePercentage = $totalStudents > 0 ? round(($presentCount / $totalStudents) * 100) : 0;

        // 2. Tardanzas Totales (Hoy)
        $lateCount = AttendanceRecord::whereDate('date', $today)
                                     ->where('status', 'late')
                                     ->count();

        // 3. Ausentes (Sin justificar - Hoy)
        // Nota: Esto es un cálculo simplificado. En un sistema real se cruzaría con horarios.
        // Asumimos que si no hay registro es ausente.
        $absentCount = $totalStudents - ($presentCount + $lateCount); // Simplificación
        if ($absentCount < 0) $absentCount = 0;

        // 4. Notificaciones Enviadas (Total histórico o del mes)
        $notificationsCount = Notification::count();

        return response()->json([
            'attendance_percentage' => $attendancePercentage,
            'late_count' => $lateCount,
            'absent_count' => $absentCount,
            'notifications_sent' => $notificationsCount
        ]);
    }
}
