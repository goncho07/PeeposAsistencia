<?php

namespace App\Services\Biometric;

use App\Models\FaceEmbedding;
use App\Models\Student;
use App\Models\Teacher;
use App\Traits\LogsActivity;
use Illuminate\Support\Facades\Log;

class FaceEnrollmentService
{
    use LogsActivity;

    public function __construct(
        protected FaceRecognitionService $faceService
    ) {}

    /**
     * Enroll a student's face.
     *
     * @param Student $student
     * @return FaceEmbedding
     */
    public function enrollStudent(Student $student): FaceEmbedding
    {
        return $this->enroll($student, $student->photo_url);
    }

    /**
     * Enroll a teacher's face.
     *
     * @param Teacher $teacher
     * @return FaceEmbedding
     */
    public function enrollTeacher(Teacher $teacher): FaceEmbedding
    {
        return $this->enroll($teacher, $teacher->photo_url);
    }

    /**
     * Enroll a face for any entity.
     *
     * @param Student|Teacher $entity
     * @param string|null $photoUrl
     * @return FaceEmbedding
     */
    protected function enroll($entity, ?string $photoUrl): FaceEmbedding
    {
        $externalId = FaceEmbedding::generateExternalId(get_class($entity), $entity->id);

        $embedding = FaceEmbedding::updateOrCreate(
            [
                'embeddable_type' => get_class($entity),
                'embeddable_id' => $entity->id,
            ],
            [
                'external_id' => $externalId,
                'status' => FaceEmbedding::STATUS_PENDING,
                'source_image_url' => $photoUrl,
            ]
        );

        if (!$photoUrl) {
            $embedding->markAsFailed('No photo URL available');
            return $embedding;
        }

        try {
            $fullImageUrl = get_storage_url($photoUrl);

            $result = $this->faceService->enroll(
                $entity->tenant_id,
                $externalId,
                $fullImageUrl
            );

            if ($result['success']) {
                $embedding->markAsActive();

                $this->logActivity('face_enrolled', $entity, [
                    'external_id' => $externalId,
                    'confidence' => $result['confidence'],
                ]);

                Log::info('Face enrolled successfully', [
                    'external_id' => $externalId,
                    'confidence' => $result['confidence'],
                ]);
            } else {
                $error = $result['error'] ?? 'Unknown error';

                if ($error === 'NO_FACE_DETECTED') {
                    $embedding->markAsNoFace();
                } else {
                    $embedding->markAsFailed($result['message'] ?? $error);
                }

                Log::warning('Face enrollment failed', [
                    'external_id' => $externalId,
                    'error' => $error,
                ]);
            }

        } catch (\Exception $e) {
            $embedding->markAsFailed($e->getMessage());

            Log::error('Face enrollment exception', [
                'external_id' => $externalId,
                'error' => $e->getMessage(),
            ]);
        }

        return $embedding;
    }

    /**
     * Re-enroll a face (e.g., after photo update).
     *
     * @param FaceEmbedding $embedding
     * @return FaceEmbedding
     */
    public function reenroll(FaceEmbedding $embedding): FaceEmbedding
    {
        $entity = $embedding->embeddable;

        if (!$entity) {
            $embedding->markAsFailed('Entity not found');
            return $embedding;
        }

        $photoUrl = match (true) {
            $entity instanceof Student => $entity->photo_url,
            $entity instanceof Teacher => $entity->photo_url,
            default => null,
        };

        return $this->enroll($entity, $photoUrl);
    }

    /**
     * Delete a face enrollment.
     *
     * @param FaceEmbedding $embedding
     * @return bool
     */
    public function delete(FaceEmbedding $embedding): bool
    {
        $deleted = $this->faceService->delete(
            $embedding->tenant_id,
            $embedding->external_id
        );

        $embedding->delete();

        if ($deleted) {
            Log::info('Face enrollment deleted', [
                'external_id' => $embedding->external_id,
            ]);
        }

        return $deleted;
    }

    /**
     * Bulk enroll all students for a tenant.
     *
     * @param int $tenantId
     * @param callable|null $onProgress
     * @return array{enrolled: int, failed: int, skipped: int}
     */
    public function enrollAllStudents(int $tenantId, ?callable $onProgress = null): array
    {
        $stats = ['enrolled' => 0, 'failed' => 0, 'skipped' => 0];

        $students = Student::where('tenant_id', $tenantId)
            ->whereNotNull('photo_url')
            ->where('photo_url', '!=', '')
            ->enrolled()
            ->get();

        foreach ($students as $student) {
            if ($student->hasFaceEnrolled()) {
                $stats['skipped']++;
                continue;
            }

            $embedding = $this->enrollStudent($student);

            if ($embedding->isActive()) {
                $stats['enrolled']++;
            } else {
                $stats['failed']++;
            }

            if ($onProgress) {
                $onProgress($stats);
            }
        }

        return $stats;
    }

    /**
     * Bulk enroll all teachers for a tenant.
     *
     * @param int $tenantId
     * @param callable|null $onProgress
     * @return array{enrolled: int, failed: int, skipped: int}
     */
    public function enrollAllTeachers(int $tenantId, ?callable $onProgress = null): array
    {
        $stats = ['enrolled' => 0, 'failed' => 0, 'skipped' => 0];

        $teachers = Teacher::where('tenant_id', $tenantId)
            ->whereHas('user', function ($q) {
                $q->where('status', 'ACTIVO')
                    ->whereNotNull('photo_url')
                    ->where('photo_url', '!=', '');
            })
            ->get();

        foreach ($teachers as $teacher) {
            if ($teacher->hasFaceEnrolled()) {
                $stats['skipped']++;
                continue;
            }

            $embedding = $this->enrollTeacher($teacher);

            if ($embedding->isActive()) {
                $stats['enrolled']++;
            } else {
                $stats['failed']++;
            }

            if ($onProgress) {
                $onProgress($stats);
            }
        }

        return $stats;
    }

    /**
     * Retry failed enrollments for a tenant.
     *
     * @param int $tenantId
     * @param int $hoursOld Only retry failures older than this
     * @return array{retried: int, success: int, failed: int}
     */
    public function retryFailed(int $tenantId, int $hoursOld = 24): array
    {
        $stats = ['retried' => 0, 'success' => 0, 'failed' => 0];

        $embeddings = FaceEmbedding::forTenant($tenantId)
            ->needsRetry($hoursOld)
            ->get();

        foreach ($embeddings as $embedding) {
            $stats['retried']++;

            $result = $this->reenroll($embedding);

            if ($result->isActive()) {
                $stats['success']++;
            } else {
                $stats['failed']++;
            }
        }

        return $stats;
    }
}
