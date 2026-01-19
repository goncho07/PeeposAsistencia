<?php

namespace App\Http\Requests\Students;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StudentUpdateRequest extends FormRequest
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
        $studentId = $this->route('id');

        return [
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'paternal_surname' => ['sometimes', 'required', 'string', 'max:50'],
            'maternal_surname' => ['sometimes', 'required', 'string', 'max:50'],
            'document_type' => ['sometimes', 'required', 'in:DNI,CE,PAS,CI,PTP'],
            'document_number' => [
                'sometimes',
                'required',
                'string',
                'max:20',
                Rule::unique('students', 'document_number')
                    ->where('tenant_id', $tenantId)
                    ->ignore($studentId)
            ],
            'birth_date' => ['sometimes', 'required', 'date', 'before:today'],
            'classroom_id' => [
                'sometimes',
                'required',
                Rule::exists('classrooms', 'id')
                    ->where('tenant_id', $tenantId)
                    ->where('status', 'ACTIVO')
            ],
            'enrollment_status' => ['sometimes', 'in:MATRICULADO,RETIRADO,TRASLADADO,EGRESADO'],
            'photo_url' => ['nullable', 'url', 'max:500'],
            'parents' => ['sometimes', 'array', 'max:4'],
            'parents.*.parent_id' => [
                'required',
                Rule::exists('parents', 'id')
                    ->where('tenant_id', $tenantId)
            ],
            'parents.*.relationship_type' => ['required', 'in:PADRE,MADRE,APODERADO'],
            'parents.*.custom_relationship_label' => ['nullable', 'string', 'max:50'],
            'parents.*.is_primary_contact' => ['boolean'],
            'parents.*.receives_notifications' => ['boolean'],
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
            'name.required' => 'El nombre es obligatorio.',
            'name.max' => 'El nombre no puede tener más de 100 caracteres.',
            'paternal_surname.required' => 'El apellido paterno es obligatorio.',
            'maternal_surname.required' => 'El apellido materno es obligatorio.',
            'document_type.required' => 'El tipo de documento es obligatorio.',
            'document_type.in' => 'El tipo de documento no es válido.',
            'document_number.required' => 'El número de documento es obligatorio.',
            'document_number.unique' => 'El número de documento ya está registrado en esta institución.',
            'birth_date.required' => 'La fecha de nacimiento es obligatoria.',
            'birth_date.before' => 'La fecha de nacimiento debe ser anterior a hoy.',
            'classroom_id.required' => 'El aula es obligatoria.',
            'classroom_id.exists' => 'El aula seleccionada no existe o está inactiva.',
            'enrollment_status.in' => 'El estado de matrícula no es válido.',
            'parents.max' => 'No se pueden asignar más de 4 apoderados a un estudiante.',
            'parents.*.parent_id.required' => 'El ID del apoderado es obligatorio.',
            'parents.*.parent_id.exists' => 'Uno de los apoderados seleccionados no existe.',
            'parents.*.relationship_type.required' => 'El tipo de relación es obligatorio.',
            'parents.*.relationship_type.in' => 'El tipo de relación no es válido.',
        ];
    }
}
