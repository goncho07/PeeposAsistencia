<?php

namespace App\Http\Requests\Classrooms;

use App\Constants\ValidationConstants;
use App\Models\Classroom;
use App\Validation\Messages;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ClassroomUpdateRequest extends FormRequest
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
            'tutor_id' => [
                'sometimes',
                'nullable',
                Rule::exists('teachers', 'id')
                    ->where('tenant_id', $tenantId)
                    ->where('status', 'ACTIVO')
            ],
            'level' => ['sometimes', 'required', ValidationConstants::LEVELS_RULE],
            'grade' => ['sometimes', 'required', 'integer', 'min:1', 'max:6'],
            'section' => ['sometimes', 'required', 'string', 'max:10'],
            'shift' => ['sometimes', 'nullable', ValidationConstants::SHIFTS_RULE],
            'room_number' => ['sometimes', 'nullable', 'string', 'max:20'],
            'capacity' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:100'],
            'status' => ['sometimes', ValidationConstants::CLASSROOM_STATUSES_RULE],
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

            if ($level && $grade && !ValidationConstants::isValidGradeForLevel($level, $grade)) {
                $maxGrade = ValidationConstants::getMaxGrade($level);
                $validator->errors()->add('grade', "El grado no puede ser mayor a {$maxGrade} para el nivel {$level}.");
            }

            if ($this->hasAny(['level', 'grade', 'section', 'shift'])) {
                $classroomId = $this->route('classroom');
                $currentClassroom = Classroom::findOrFail($classroomId);

                $level = $this->input('level', $currentClassroom->level);
                $grade = $this->input('grade', $currentClassroom->grade);
                $section = $this->input('section', $currentClassroom->section);
                $shift = $this->input('shift', $currentClassroom->shift);

                $exists = Classroom::where('level', $level)
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
        return Messages::classroom();
    }
}