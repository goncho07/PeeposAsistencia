<?php

namespace App\Traits;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

trait LogsActivity
{
    protected function logActivity(string $action, ?Model $subject = null, array $properties = [], ?User $user = null): ?ActivityLog 
    {
        try {
            $user = $user ?? Auth::user();

            if (!$user) {
                return null;
            }

            if (!$subject) {
                $subject = $user;
            }

            $subject_type = get_class($subject);
            $subject_id = $subject->id;

            return ActivityLog::create([
                'tenant_id' => $user->tenant_id,
                'user_id' => $user->id,
                'action' => $action,
                'description' => $this->getActionDescription($action),
                'subject_type' => $subject_type,
                'subject_id' => $subject_id,
                'properties' => $properties,
                'ip_address' => client_ip(),
                'user_agent' => request()->userAgent(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to log activity: ' . $e->getMessage(), [
                'action' => $action,
                'user_id' => $user?->id,
                'exception' => $e,
            ]);

            return null;
        }
    }

    protected function logActivityWithChanges(string $action, Model $subject, array $oldValues, array $newValues, ?User $user = null): ?ActivityLog 
    {
        try {
            $user = $user ?? Auth::user();

            if (!$user) {
                return null;
            }

            return ActivityLog::create([
                'tenant_id' => $user->tenant_id,
                'user_id' => $user->id,
                'action' => $action,
                'description' => $this->getActionDescription($action),
                'subject_type' => get_class($subject),
                'subject_id' => $subject->id,
                'old_values' => $oldValues,
                'new_values' => $newValues,
                'properties' => [
                    'changes' => array_keys($newValues),
                ],
                'ip_address' => client_ip(),
                'user_agent' => request()->userAgent(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to log activity: ' . $e->getMessage());
            return null;
        }
    }

    protected function getActionDescription(string $action): string
    {
        $descriptions = [
            'user_login' => 'Usuario inició sesión',
            'user_logout' => 'Usuario cerró sesión',
            'user_logout_all_devices' => 'Usuario cerró sesión en todos los dispositivos',
            'token_refreshed' => 'Usuario renovó su token',
            'session_revoked' => 'Usuario revocó una sesión',

            'student_created' => 'Estudiante creado',
            'student_updated' => 'Estudiante actualizado',
            'student_deleted' => 'Estudiante eliminado',

            'teacher_created' => 'Docente creado',
            'teacher_updated' => 'Docente actualizado',
            'teacher_deleted' => 'Docente eliminado',

            'classroom_created' => 'Aula creada',
            'classroom_updated' => 'Aula actualizada',
            'classroom_deleted' => 'Aula eliminada',

            'attendance_registered' => 'Asistencia registrada',
            'attendance_entry_registered' => 'Entrada registrada',
            'attendance_exit_registered' => 'Salida registrada',
            'attendance_updated' => 'Asistencia actualizada',

            'justification_created' => 'Justificación creada',
            'justification_approved' => 'Justificación aprobada',
            'justification_rejected' => 'Justificación rechazada',

            'setting_updated' => 'Configuración actualizada',

            'user_created' => 'Usuario creado',
            'user_updated' => 'Usuario actualizado',
            'user_deleted' => 'Usuario eliminado',

            'carnet_generation_requested' => 'Generación de carnets solicitada',
            'carnet_generation_completed' => 'Generación de carnets completada',
            'carnet_generation_failed' => 'Generación de carnets falló',
            'carnet_generation_downloaded' => 'Carnets descargados',
        ];

        return $descriptions[$action] ?? $action;
    }
}
