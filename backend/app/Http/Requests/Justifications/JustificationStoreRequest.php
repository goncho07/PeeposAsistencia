<?php

namespace App\Http\Requests\Justifications;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class JustificationStoreRequest extends FormRequest
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
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $tenantId = $this->user()->tenant_id;

        return [
            'justifiable_type' => [
                'required',
                'string',
                Rule::in(['App\Models\Student', 'App\Models\Teacher']),
            ],
            'justifiable_id' => [
                'required',
                'integer',
                function ($attribute, $value, $fail) use ($tenantId) {
                    $type = $this->input('justifiable_type');

                    if ($type === 'App\Models\Student') {
                        $exists = \App\Models\Student::where('tenant_id', $tenantId)
                            ->where('id', $value)
                            ->exists();

                        if (!$exists) {
                            $fail('El estudiante seleccionado no existe o no pertenece a su institución.');
                        }
                    } elseif ($type === 'App\Models\Teacher') {
                        $exists = \App\Models\Teacher::where('tenant_id', $tenantId)
                            ->where('id', $value)
                            ->exists();

                        if (!$exists) {
                            $fail('El docente seleccionado no existe o no pertenece a su institución.');
                        }
                    }
                },
            ],
            'date_from' => [
                'required',
                'date',
            ],
            'date_to' => [
                'required',
                'date',
                'after_or_equal:date_from',
            ],
            'type' => [
                'required',
                'string',
                Rule::in(['FALTA', 'TARDANZA', 'SALIDA_ANTICIPADA']),
            ],
            'reason' => [
                'required',
                'string',
                'max:500',
            ],
            'document_path' => [
                'nullable',
                'string',
                'max:255',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'justifiable_type.required' => 'El tipo de persona es obligatorio.',
            'justifiable_type.in' => 'El tipo de persona debe ser Estudiante o Docente.',
            'justifiable_id.required' => 'Debe seleccionar una persona.',
            'justifiable_id.integer' => 'El ID de la persona debe ser un número.',
            'date_from.required' => 'La fecha de inicio es obligatoria.',
            'date_from.date' => 'La fecha de inicio debe ser una fecha válida.',
            'date_to.required' => 'La fecha de fin es obligatoria.',
            'date_to.date' => 'La fecha de fin debe ser una fecha válida.',
            'date_to.after_or_equal' => 'La fecha de fin debe ser igual o posterior a la fecha de inicio.',
            'type.required' => 'El tipo de justificación es obligatorio.',
            'type.in' => 'El tipo debe ser FALTA, TARDANZA o SALIDA_ANTICIPADA.',
            'reason.required' => 'El motivo es obligatorio.',
            'reason.max' => 'El motivo no puede tener más de 500 caracteres.',
            'document_path.max' => 'La ruta del documento no puede tener más de 255 caracteres.',
        ];
    }
}