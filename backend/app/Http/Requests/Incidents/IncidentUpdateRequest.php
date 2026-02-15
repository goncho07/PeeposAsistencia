<?php

namespace App\Http\Requests\Incidents;

use App\Models\Incident;
use App\Models\Student;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IncidentUpdateRequest extends FormRequest
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
            'classroom_id' => [
                'sometimes',
                Rule::exists('classrooms', 'id')->where('tenant_id', $tenantId)
            ],
            'student_id' => [
                'sometimes',
                Rule::exists('students', 'id')->where('tenant_id', $tenantId)
            ],
            'type' => 'sometimes|in:' . implode(',', array_keys(Incident::TYPES)),
            'severity' => 'sometimes|in:' . implode(',', array_keys(Incident::SEVERITIES)),
            'description' => 'nullable|string|max:1000',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($this->hasAny(['classroom_id', 'student_id'])) {
                $incident = Incident::find($this->route('id'));
                if (!$incident) {
                    return;
                }

                $classroomId = $this->input('classroom_id', $incident->classroom_id);
                $studentId = $this->input('student_id', $incident->student_id);

                $student = Student::find($studentId);

                if ($student && $student->classroom_id != $classroomId) {
                    $validator->errors()->add(
                        'student_id',
                        'El estudiante no pertenece al aula seleccionada.'
                    );
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
            'classroom_id.exists' => 'El aula seleccionada no existe.',
            'student_id.exists' => 'El estudiante seleccionado no existe.',
            'type.in' => 'El tipo de incidencia no es válido.',
            'severity.in' => 'La gravedad seleccionada no es válida.',
            'description.max' => 'La descripción no puede exceder 1000 caracteres.',
        ];
    }
}
