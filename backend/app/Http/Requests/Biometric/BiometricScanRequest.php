<?php

namespace App\Http\Requests\Biometric;

use Illuminate\Foundation\Http\FormRequest;

class BiometricScanRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'image' => [
                'required',
                'string',
                function ($attribute, $value, $fail) {
                    if (!preg_match('/^data:image\/(jpeg|jpg|png);base64,/', $value)) {
                        $fail('La imagen debe estar en formato base64 válido (JPEG o PNG).');
                        return;
                    }

                    $imageData = preg_replace('/^data:image\/\w+;base64,/', '', $value);
                    $decoded = base64_decode($imageData, true);

                    if ($decoded === false) {
                        $fail('La imagen base64 está corrupta o es inválida.');
                        return;
                    }

                    $maxSizeMb = config('biometric.image.max_size_mb', 5);
                    $maxSizeBytes = $maxSizeMb * 1024 * 1024;

                    if (strlen($decoded) > $maxSizeBytes) {
                        $fail("La imagen no puede superar {$maxSizeMb}MB.");
                    }
                },
            ],
            'classroom_id' => 'nullable|integer|exists:classrooms,id',
            'level' => 'nullable|string|in:INICIAL,PRIMARIA,SECUNDARIA',
            'device_id' => 'nullable|string|max:50',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'image.required' => 'Se requiere una imagen para el escaneo biométrico.',
            'image.string' => 'La imagen debe ser una cadena base64.',
            'classroom_id.exists' => 'El aula especificada no existe.',
            'level.in' => 'El nivel debe ser INICIAL, PRIMARIA o SECUNDARIA.',
        ];
    }

    /**
     * Get the raw image bytes from the base64 string.
     */
    public function getImageBytes(): string
    {
        $base64 = $this->input('image');
        $imageData = preg_replace('/^data:image\/\w+;base64,/', '', $base64);
        return base64_decode($imageData);
    }
}
