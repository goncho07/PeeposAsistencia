<?php

namespace App\Http\Requests\Incidents;

use App\Models\Incident;
use App\Models\Student;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IncidentStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $tenantId = $this->user()->tenant_id;

        return [
            'classroom_id' => [
                'required',
                Rule::exists('classrooms', 'id')->where('tenant_id', $tenantId)
            ],
            'student_id' => [
                'required',
                Rule::exists('students', 'id')->where('tenant_id', $tenantId)
            ],
            'type' => 'required|in:' . implode(',', array_keys(Incident::TYPES)),
            'description' => 'nullable|string|max:1000',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $classroomId = $this->input('classroom_id');
            $studentId = $this->input('student_id');

            if ($classroomId && $studentId) {
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
            'classroom_id.required' => 'El aula es requerida.',
            'classroom_id.exists' => 'El aula seleccionada no existe.',
            'student_id.required' => 'El estudiante es requerido.',
            'student_id.exists' => 'El estudiante seleccionado no existe.',
            'type.required' => 'El tipo de incidencia es requerido.',
            'type.in' => 'El tipo de incidencia no es válido.',
            'description.max' => 'La descripción no puede exceder 1000 caracteres.',
        ];
    }
}
