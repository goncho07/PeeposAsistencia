<?php

namespace App\Http\Requests\Students;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StudentStoreRequest extends FormRequest
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
            'student_code' => [
                'required',
                'string',
                'max:20',
                Rule::unique('students', 'student_code')
                    ->where('tenant_id', $tenantId)
            ],
            'document_type' => ['required', 'in:DNI,CE,PAS,CI,PTP'],
            'document_number' => [
                'required',
                'string',
                'max:20',
                Rule::unique('students', 'document_number')
                    ->where('tenant_id', $tenantId)
            ],
            'name' => ['required', 'string', 'max:100'],
            'paternal_surname' => ['required', 'string', 'max:50'],
            'maternal_surname' => ['required', 'string', 'max:50'],
            'gender' => ['required', 'in:M,F'],
            'birth_date' => ['required', 'date', 'before:today'],
            'birth_place' => ['nullable', 'string', 'max:100'],
            'nationality' => ['nullable', 'string', 'max:50'],
            'classroom_id' => [
                'required',
                Rule::exists('classrooms', 'id')
                    ->where('tenant_id', $tenantId)
                    ->where('status', 'ACTIVO')
            ],
            'academic_year' => ['nullable', 'integer', 'min:2020', 'max:2099'],
            'blood_type' => ['nullable', 'in:A+,A-,B+,B-,AB+,AB-,O+,O-'],
            'health_insurance' => ['nullable', 'in:SIS,ESSALUD,PRIVADO,NINGUNO'],
            'allergies' => ['nullable', 'string', 'max:500'],
            'medical_conditions' => ['nullable', 'string', 'max:500'],
            'address' => ['nullable', 'string', 'max:255'],
            'emergency_contact_name' => ['nullable', 'string', 'max:150'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:15'],
            'parents' => ['nullable', 'array', 'max:4'],
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
            'student_code.required' => 'El código del estudiante es obligatorio.',
            'student_code.unique' => 'El código del estudiante ya está registrado en esta institución.',
            'document_type.required' => 'El tipo de documento es obligatorio.',
            'document_type.in' => 'El tipo de documento no es válido.',
            'document_number.required' => 'El número de documento es obligatorio.',
            'document_number.unique' => 'El número de documento ya está registrado en esta institución.',
            'name.required' => 'El nombre es obligatorio.',
            'name.max' => 'El nombre no puede tener más de 100 caracteres.',
            'paternal_surname.required' => 'El apellido paterno es obligatorio.',
            'maternal_surname.required' => 'El apellido materno es obligatorio.',
            'gender.required' => 'El género es obligatorio.',
            'gender.in' => 'El género no es válido.',
            'birth_date.required' => 'La fecha de nacimiento es obligatoria.',
            'birth_date.before' => 'La fecha de nacimiento debe ser anterior a hoy.',
            'classroom_id.required' => 'El aula es obligatoria.',
            'classroom_id.exists' => 'El aula seleccionada no existe o está inactiva.',
            'blood_type.in' => 'El tipo de sangre no es válido.',
            'health_insurance.in' => 'El tipo de seguro de salud no es válido.',
            'parents.max' => 'No se pueden asignar más de 4 apoderados a un estudiante.',
            'parents.*.parent_id.required' => 'El ID del apoderado es obligatorio.',
            'parents.*.parent_id.exists' => 'Uno de los apoderados seleccionados no existe.',
            'parents.*.relationship_type.required' => 'El tipo de relación es obligatorio.',
            'parents.*.relationship_type.in' => 'El tipo de relación no es válido.',
        ];
    }
}
