<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Biometric Recognition Settings
    |--------------------------------------------------------------------------
    |
    | Configuration for the face recognition microservice used for
    | biometric attendance registration.
    |
    */

    'enabled' => env('BIOMETRIC_ENABLED', false),

    /*
    |--------------------------------------------------------------------------
    | Face Service Connection
    |--------------------------------------------------------------------------
    |
    | The URL and timeout settings for connecting to the Python
    | face recognition microservice.
    |
    */

    'service_url' => env('FACE_SERVICE_URL', 'http://localhost:8001'),
    'service_timeout' => env('FACE_SERVICE_TIMEOUT', 30),

    /*
    |--------------------------------------------------------------------------
    | Matching Thresholds
    |--------------------------------------------------------------------------
    |
    | Confidence thresholds for face matching.
    | Higher values = stricter matching.
    |
    | match_high: Auto-accept match (very confident)
    | match_medium: Accept with warning logged
    | match_low: Minimum threshold (reject if lower)
    |
    */

    'thresholds' => [
        'match_high' => (float) env('BIOMETRIC_THRESHOLD_HIGH', 90.0),
        'match_medium' => (float) env('BIOMETRIC_THRESHOLD_MEDIUM', 80.0),
        'match_low' => (float) env('BIOMETRIC_THRESHOLD_LOW', 60.0),
    ],

    /*
    |--------------------------------------------------------------------------
    | Distance Threshold
    |--------------------------------------------------------------------------
    |
    | The face_recognition library uses Euclidean distance.
    | Lower values = stricter matching.
    | Default: 0.6 (standard threshold)
    |
    */

    'distance_threshold' => (float) env('BIOMETRIC_DISTANCE_THRESHOLD', 0.6),

    /*
    |--------------------------------------------------------------------------
    | Enrollment Settings
    |--------------------------------------------------------------------------
    |
    | Configuration for automatic face enrollment when photos are uploaded.
    |
    */

    'enrollment' => [
        'auto_enroll' => env('BIOMETRIC_AUTO_ENROLL', true),
        'retry_failed_hours' => 24,
        'max_retries' => 3,
    ],

    /*
    |--------------------------------------------------------------------------
    | Image Settings
    |--------------------------------------------------------------------------
    |
    | Constraints for uploaded images used in face recognition.
    |
    */

    'image' => [
        'max_size_mb' => 5,
        'allowed_formats' => ['jpeg', 'jpg', 'png'],
    ],
];
