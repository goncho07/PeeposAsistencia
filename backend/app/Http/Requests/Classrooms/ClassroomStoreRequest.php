<?php

namespace App\Http\Requests\Classrooms;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ClassroomStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', \App\Models\Classroom::class);
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
            'teacher_id' => [
                'nullable',
                Rule::exists('teachers', 'id')
                    ->where('tenant_id', $tenantId)
                    ->where('status', 'ACTIVO')
            ],
            'level' => ['required', 'in:INICIAL,PRIMARIA,SECUNDARIA'],
            'grade' => ['required', 'integer', 'min:1', 'max:6'],
            'section' => ['required', 'string', 'max:50'],
            'shift' => ['nullable', 'in:MAÑANA,TARDE,NOCHE'],
            'status' => ['nullable', 'in:ACTIVO,INACTIVO,CERRADO'],
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $level = $this->input('level');
            $grade = $this->input('grade');

            $maxGrades = [
                'INICIAL' => 3,
                'PRIMARIA' => 6,
                'SECUNDARIA' => 5,
            ];

            if (isset($maxGrades[$level]) && $grade > $maxGrades[$level]) {
                $validator->errors()->add('grade', "El grado no puede ser mayor a {$maxGrades[$level]} para el nivel {$level}.");
            }

            $tenantId = $this->user()->tenant_id;
            $exists = \App\Models\Classroom::where('tenant_id', $tenantId)
                ->where('level', $this->input('level'))
                ->where('grade', $this->input('grade'))
                ->where('section', $this->input('section'))
                ->where('shift', $this->input('shift'))
                ->exists();

            if ($exists) {
                $validator->errors()->add('section', 'Ya existe un aula con esta combinación de nivel, grado, sección y turno.');
            }
        });
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'teacher_id.exists' => 'El docente seleccionado no existe o está inactivo.',
            'level.required' => 'El nivel es obligatorio.',
            'level.in' => 'El nivel debe ser INICIAL, PRIMARIA o SECUNDARIA.',
            'grade.required' => 'El grado es obligatorio.',
            'grade.integer' => 'El grado debe ser un número.',
            'grade.min' => 'El grado debe ser al menos 1.',
            'grade.max' => 'El grado no puede ser mayor a 6.',
            'section.required' => 'La sección es obligatoria.',
            'section.max' => 'La sección no puede tener más de 50 caracteres.',
            'shift.in' => 'El turno debe ser MAÑANA, TARDE o NOCHE.',
            'status.in' => 'El estado no es válido.',
        ];
    }
}