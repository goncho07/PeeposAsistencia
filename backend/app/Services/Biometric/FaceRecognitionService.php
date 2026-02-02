<?php

namespace App\Services\Biometric;

use App\Exceptions\BiometricException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FaceRecognitionService
{
    protected string $baseUrl;
    protected int $timeout;
    protected float $distanceThreshold;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('biometric.service_url'), '/');
        $this->timeout = config('biometric.service_timeout', 30);
        $this->distanceThreshold = config('biometric.distance_threshold', 0.6);
    }

    /**
     * Enroll a face from an image URL.
     *
     * @param int $tenantId
     * @param string $externalId Format: "student_123" or "teacher_456"
     * @param string $imageUrl URL to the image
     * @return array{success: bool, confidence: ?float, error: ?string}
     * @throws BiometricException
     */
    public function enrollFromUrl(int $tenantId, string $externalId, string $imageUrl): array
    {
        return $this->enroll($tenantId, $externalId, imageUrl: $imageUrl);
    }

    /**
     * Enroll a face from base64 image data.
     *
     * @param int $tenantId
     * @param string $externalId
     * @param string $imageBase64
     * @return array{success: bool, confidence: ?float, error: ?string}
     * @throws BiometricException
     */
    public function enrollFromBase64(int $tenantId, string $externalId, string $imageBase64): array
    {
        return $this->enroll($tenantId, $externalId, imageBase64: $imageBase64);
    }

    /**
     * Enroll a face into the recognition system.
     */
    protected function enroll(
        int $tenantId,
        string $externalId,
        ?string $imageUrl = null,
        ?string $imageBase64 = null
    ): array {
        try {
            $payload = [
                'tenant_id' => $tenantId,
                'external_id' => $externalId,
            ];

            if ($imageUrl) {
                $payload['image_url'] = $imageUrl;
            } else {
                $payload['image_base64'] = $imageBase64;
            }

            $response = Http::timeout($this->timeout)
                ->post("{$this->baseUrl}/enroll", $payload);

            if (!$response->successful()) {
                Log::error('Face service enrollment failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                throw BiometricException::serviceUnavailable('HTTP ' . $response->status());
            }

            $data = $response->json();

            if (!$data['success']) {
                return [
                    'success' => false,
                    'confidence' => null,
                    'error' => $data['error'] ?? 'UNKNOWN_ERROR',
                    'message' => $data['message'] ?? 'Unknown error',
                ];
            }

            return [
                'success' => true,
                'confidence' => $data['confidence'] ?? null,
                'error' => null,
            ];

        } catch (BiometricException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('Face service connection failed', [
                'error' => $e->getMessage(),
            ]);
            throw BiometricException::serviceUnavailable($e->getMessage());
        }
    }

    /**
     * Search for matching faces.
     *
     * @param int $tenantId
     * @param string $imageBase64
     * @param float|null $threshold Override default threshold
     * @param int $limit Max matches to return
     * @return array{success: bool, matches: array, error: ?string}
     * @throws BiometricException
     */
    public function search(
        int $tenantId,
        string $imageBase64,
        ?float $threshold = null,
        int $limit = 5
    ): array {
        try {
            $response = Http::timeout($this->timeout)
                ->post("{$this->baseUrl}/search", [
                    'tenant_id' => $tenantId,
                    'image_base64' => $imageBase64,
                    'threshold' => $threshold ?? $this->distanceThreshold,
                    'limit' => $limit,
                ]);

            if (!$response->successful()) {
                Log::error('Face service search failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                throw BiometricException::serviceUnavailable('HTTP ' . $response->status());
            }

            $data = $response->json();

            if (!$data['success']) {
                $error = $data['error'] ?? 'UNKNOWN_ERROR';

                return match ($error) {
                    'NO_FACE_DETECTED' => throw BiometricException::noFaceDetected(),
                    'MULTIPLE_FACES' => throw BiometricException::multipleFaces(),
                    'IMAGE_LOAD_ERROR' => throw BiometricException::imageLoadError($data['message'] ?? ''),
                    default => [
                        'success' => false,
                        'matches' => [],
                        'error' => $error,
                    ],
                };
            }

            return [
                'success' => true,
                'matches' => $data['matches'] ?? [],
                'error' => null,
            ];

        } catch (BiometricException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('Face service connection failed', [
                'error' => $e->getMessage(),
            ]);
            throw BiometricException::serviceUnavailable($e->getMessage());
        }
    }

    /**
     * Delete a face from the recognition system.
     *
     * @param int $tenantId
     * @param string $externalId
     * @return bool
     */
    public function delete(int $tenantId, string $externalId): bool
    {
        try {
            $response = Http::timeout($this->timeout)
                ->delete("{$this->baseUrl}/faces/{$externalId}", [
                    'tenant_id' => $tenantId,
                ]);

            if (!$response->successful()) {
                Log::warning('Face deletion failed', [
                    'external_id' => $externalId,
                    'status' => $response->status(),
                ]);
                return false;
            }

            return $response->json()['success'] ?? false;

        } catch (\Exception $e) {
            Log::error('Face service delete failed', [
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Check if the face service is healthy.
     *
     * @return bool
     */
    public function isHealthy(): bool
    {
        try {
            $response = Http::timeout(5)->get("{$this->baseUrl}/health");

            if (!$response->successful()) {
                return false;
            }

            return ($response->json()['status'] ?? '') === 'healthy';

        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Get the count of enrolled faces for a tenant.
     *
     * @param int $tenantId
     * @return int
     */
    public function getEnrolledCount(int $tenantId): int
    {
        try {
            $response = Http::timeout(5)
                ->get("{$this->baseUrl}/faces/count", [
                    'tenant_id' => $tenantId,
                ]);

            if (!$response->successful()) {
                return 0;
            }

            return $response->json()['count'] ?? 0;

        } catch (\Exception $e) {
            return 0;
        }
    }
}
