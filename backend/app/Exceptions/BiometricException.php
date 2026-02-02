<?php

namespace App\Exceptions;

use Exception;

class BiometricException extends Exception
{
    public const NO_FACE_DETECTED = 'NO_FACE_DETECTED';
    public const MULTIPLE_FACES = 'MULTIPLE_FACES';
    public const NO_MATCH = 'NO_MATCH';
    public const LOW_CONFIDENCE = 'LOW_CONFIDENCE';
    public const IMAGE_LOAD_ERROR = 'IMAGE_LOAD_ERROR';
    public const SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE';
    public const NOT_ENROLLED = 'NOT_ENROLLED';
    public const ENROLLMENT_FAILED = 'ENROLLMENT_FAILED';

    protected string $errorCode;
    protected array $suggestions;
    protected ?array $data;

    public function __construct(
        string $message,
        string $errorCode,
        array $suggestions = [],
        ?array $data = null,
        int $httpCode = 422
    ) {
        parent::__construct($message, $httpCode);
        $this->errorCode = $errorCode;
        $this->suggestions = $suggestions;
        $this->data = $data;
    }

    public function getErrorCode(): string
    {
        return $this->errorCode;
    }

    public function getSuggestions(): array
    {
        return $this->suggestions;
    }

    public function getData(): ?array
    {
        return $this->data;
    }

    public function getHttpCode(): int
    {
        return $this->getCode();
    }

    public static function noFaceDetected(): self
    {
        return new self(
            'No se detectó ningún rostro en la imagen',
            self::NO_FACE_DETECTED,
            [
                'Asegúrese de que el rostro esté visible y mirando a la cámara',
                'Mejore la iluminación del ambiente',
                'Evite sombras en el rostro',
            ]
        );
    }

    public static function multipleFaces(): self
    {
        return new self(
            'Se detectaron múltiples rostros en la imagen',
            self::MULTIPLE_FACES,
            [
                'Solo una persona debe estar frente a la cámara',
                'Asegúrese de que no haya otras personas en el fondo',
            ]
        );
    }

    public static function noMatch(): self
    {
        return new self(
            'No se encontró coincidencia facial',
            self::NO_MATCH,
            [
                'La persona puede no estar registrada en el sistema',
                'Intente nuevamente con mejor iluminación',
                'Verifique que el registro facial esté actualizado',
            ]
        );
    }

    public static function lowConfidence(float $confidence): self
    {
        return new self(
            "Coincidencia con baja confianza ({$confidence}%)",
            self::LOW_CONFIDENCE,
            [
                'Intente nuevamente con mejor iluminación',
                'Mire directamente a la cámara',
                'Actualice la foto de perfil si ha cambiado su apariencia',
            ],
            ['confidence' => $confidence]
        );
    }

    public static function serviceUnavailable(string $error = ''): self
    {
        return new self(
            'Servicio de reconocimiento facial no disponible',
            self::SERVICE_UNAVAILABLE,
            [
                'Intente nuevamente en unos momentos',
                'Use el método de escaneo alternativo si está disponible',
            ],
            $error ? ['error' => $error] : null,
            503
        );
    }

    public static function notEnrolled(string $type, int $id): self
    {
        return new self(
            "La persona no tiene registro facial activo",
            self::NOT_ENROLLED,
            [
                'Asegúrese de que la persona tenga una foto de perfil',
                'Contacte al administrador para activar el registro facial',
            ],
            ['type' => $type, 'id' => $id]
        );
    }

    public static function enrollmentFailed(string $reason): self
    {
        return new self(
            "Error al registrar rostro: {$reason}",
            self::ENROLLMENT_FAILED,
            [
                'Verifique que la foto de perfil sea clara y muestre el rostro',
                'Intente subir una nueva foto',
            ]
        );
    }

    public static function imageLoadError(string $reason): self
    {
        return new self(
            "Error al cargar la imagen: {$reason}",
            self::IMAGE_LOAD_ERROR,
            [
                'Verifique el formato de la imagen (JPEG, PNG)',
                'Asegúrese de que la imagen no esté corrupta',
            ]
        );
    }
}
