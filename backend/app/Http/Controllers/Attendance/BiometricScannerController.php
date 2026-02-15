<?php

namespace App\Http\Controllers\Attendance;

use App\Exceptions\BiometricException;
use App\Exceptions\BusinessException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Biometric\BiometricScanRequest;
use App\Models\FaceEmbedding;
use App\Models\Student;
use App\Models\Teacher;
use App\Services\AttendanceService;
use App\Services\Biometric\FaceEnrollmentService;
use App\Services\Biometric\FaceRecognitionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BiometricScannerController extends Controller
{
    public function __construct(
        protected AttendanceService $attendanceService,
        protected FaceRecognitionService $faceService,
        protected FaceEnrollmentService $enrollmentService
    ) {}

    /**
     * Register entry via biometric face scan.
     *
     * POST /api/biometric/scan/entry
     */
    public function scanEntry(BiometricScanRequest $request): JsonResponse
    {
        if (!config('biometric.enabled')) {
            return $this->error('Biometría no está habilitada', null, 503);
        }

        try {
            $result = $this->attendanceService->scanEntryByFace(
                imageBase64: $request->input('image'),
                tenantId: app('current_tenant_id'),
                filters: [
                    'classroom_id' => $request->input('classroom_id'),
                    'level' => $request->input('level'),
                ]
            );

            return $this->success($result, $result['message']);
        } catch (BusinessException $e) {
            return $this->error($e->getMessage(), ['error_code' => 'ALREADY_REGISTERED'], 422);
        } catch (BiometricException $e) {
            return $this->error($e->getMessage(), [
                'error_code' => $e->getErrorCode(),
                'suggestions' => $e->getSuggestions(),
                'data' => $e->getData(),
            ], $e->getHttpCode());
        } catch (\Exception $e) {
            return $this->error('Error al procesar escaneo biométrico: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Register exit via biometric face scan.
     *
     * POST /api/biometric/scan/exit
     */
    public function scanExit(BiometricScanRequest $request): JsonResponse
    {
        if (!config('biometric.enabled')) {
            return $this->error('Biometría no está habilitada', null, 503);
        }

        try {
            $result = $this->attendanceService->scanExitByFace(
                imageBase64: $request->input('image'),
                tenantId: app('current_tenant_id'),
                filters: [
                    'classroom_id' => $request->input('classroom_id'),
                    'level' => $request->input('level'),
                ]
            );

            return $this->success($result, $result['message']);

        } catch (BusinessException $e) {
            return $this->error($e->getMessage(), ['error_code' => 'ALREADY_REGISTERED'], 422);
        } catch (BiometricException $e) {
            return $this->error($e->getMessage(), [
                'error_code' => $e->getErrorCode(),
                'suggestions' => $e->getSuggestions(),
                'data' => $e->getData(),
            ], $e->getHttpCode());
        } catch (\Exception $e) {
            return $this->error('Error al procesar escaneo biométrico: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Check enrollment status for a student or teacher.
     *
     * GET /api/biometric/status/{type}/{id}
     */
    public function status(string $type, int $id): JsonResponse
    {
        $entityClass = match ($type) {
            'student' => Student::class,
            'teacher' => Teacher::class,
            default => null,
        };

        if (!$entityClass) {
            return $this->error('Tipo inválido. Use "student" o "teacher".', null, 422);
        }

        $embedding = FaceEmbedding::where('embeddable_type', $entityClass)
            ->where('embeddable_id', $id)
            ->first();

        if (!$embedding) {
            return $this->success([
                'enrolled' => false,
                'status' => null,
                'enrolled_at' => null,
            ]);
        }

        return $this->success([
            'enrolled' => $embedding->isActive(),
            'status' => $embedding->status,
            'enrolled_at' => $embedding->enrolled_at?->toIso8601String(),
            'error_message' => $embedding->error_message,
        ]);
    }

    /**
     * Enroll a student or teacher face for biometric recognition.
     *
     * POST /api/biometric/enroll
     *
     * Note: This is synchronous since Cloud Run is stateless (no queue workers).
     */
    public function enroll(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'required|string|in:student,teacher',
            'id' => 'required|integer',
        ]);

        $type = $request->input('type');
        $id = $request->input('id');

        $entity = match ($type) {
            'student' => Student::find($id),
            'teacher' => Teacher::find($id),
        };

        if (!$entity) {
            return $this->error('Entidad no encontrada', null, 404);
        }

        $embedding = $type === 'student'
            ? $this->enrollmentService->enrollStudent($entity)
            : $this->enrollmentService->enrollTeacher($entity);

        if ($embedding->isActive()) {
            return $this->success([
                'enrolled' => true,
                'status' => $embedding->status,
                'enrolled_at' => $embedding->enrolled_at?->toIso8601String(),
            ], 'Rostro registrado exitosamente');
        }

        return $this->error(
            'Error al registrar rostro: ' . ($embedding->error_message ?? 'Error desconocido'),
            [
                'status' => $embedding->status,
                'error' => $embedding->error_message,
            ],
            422
        );
    }

    /**
     * Check face service health.
     *
     * GET /api/biometric/health
     */
    public function health(): JsonResponse
    {
        $healthy = $this->faceService->isHealthy();
        $tenantId = app('current_tenant_id');

        return $this->success([
            'service_healthy' => $healthy,
            'biometric_enabled' => config('biometric.enabled'),
            'enrolled_count' => $healthy ? $this->faceService->getEnrolledCount($tenantId) : null,
        ]);
    }
}
