<?php

namespace App\Http\Requests\Classrooms;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ClassroomUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $classroom = $this->route('classroom');
        return $this->user()->can('update', $classroom);
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
                'sometimes',
                'nullable',
                Rule::exists('teachers', 'id')
                    ->where('tenant_id', $tenantId)
                    ->where('status', 'ACTIVO')
            ],
            'level' => ['sometimes', 'required', 'in:INICIAL,PRIMARIA,SECUNDARIA'],
            'grade' => ['sometimes', 'required', 'integer', 'min:1', 'max:6'],
            'section' => ['sometimes', 'required', 'string', 'max:50'],
            'shift' => ['sometimes', 'nullable', 'in:MAÑANA,TARDE,NOCHE'],
            'status' => ['sometimes', 'in:ACTIVO,INACTIVO,CERRADO'],
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

            if ($level && $grade) {
                $maxGrades = [
                    'INICIAL' => 3,
                    'PRIMARIA' => 6,
                    'SECUNDARIA' => 5,
                ];

                if (isset($maxGrades[$level]) && $grade > $maxGrades[$level]) {
                    $validator->errors()->add('grade', "El grado no puede ser mayor a {$maxGrades[$level]} para el nivel {$level}.");
                }
            }

            if ($this->hasAny(['level', 'grade', 'section', 'shift'])) {
                $classroomId = $this->route('classroom');
                $tenantId = $this->user()->tenant_id;

                $currentClassroom = \App\Models\Classroom::findOrFail($classroomId);

                $level = $this->input('level', $currentClassroom->level);
                $grade = $this->input('grade', $currentClassroom->grade);
                $section = $this->input('section', $currentClassroom->section);
                $shift = $this->input('shift', $currentClassroom->shift);

                $exists = \App\Models\Classroom::where('tenant_id', $tenantId)
                    ->where('level', $level)
                    ->where('grade', $grade)
                    ->where('section', $section)
                    ->where('shift', $shift)
                    ->where('id', '!=', $classroomId)
                    ->exists();

                if ($exists) {
                    $validator->errors()->add('section', 'Ya existe un aula con esta combinación de nivel, grado, sección y turno.');
                }
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