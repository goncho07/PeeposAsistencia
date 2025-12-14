<?php

namespace App\Http\Requests\Users;

use App\Traits\ValidationMessages;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EstudianteUpdateRequest extends FormRequest
{
    use ValidationMessages;

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
        $studentId = $this->route('id');

        return [
            'student_code' => [
                'sometimes',
                'string',
                'max:20',
                Rule::unique('estudiantes', 'student_code')->ignore($studentId),
            ],
            'name' => ['sometimes', 'string', 'max:100'],
            'paternal_surname' => ['sometimes', 'string', 'max:50'],
            'maternal_surname' => ['sometimes', 'string', 'max:50'],
            'document_type' => ['sometimes', 'in:DNI,CE,PAS,CI,PTP'],
            'document_number' => [
                'sometimes',
                'string',
                'max:20',
                Rule::unique('estudiantes', 'document_number')->ignore($studentId),
            ],
            'gender' => ['sometimes', 'in:M,F'],
            'date_of_birth' => ['sometimes', 'date', 'before:today'],
            'aula_id' => ['sometimes', 'exists:aulas,id'],
            'padre_id' => ['nullable', 'exists:padres_apoderados,id'],
        ];
    }

    public function messages(): array
    {
        return array_merge($this->defaultMessages(), [
            'student_code.unique' => 'El código del estudiante ya está registrado.',
            'document_number.unique' => 'El número de documento ya está registrado.',
            'aula_id.exists' => 'El aula seleccionada no existe.',
            'date_of_birth.before' => 'La fecha de nacimiento debe ser anterior a hoy.',
        ]);
    }
}
