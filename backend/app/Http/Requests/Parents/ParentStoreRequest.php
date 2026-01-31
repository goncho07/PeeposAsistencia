<?php

namespace App\Http\Requests\Parents;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ParentStoreRequest extends FormRequest
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
            'document_type' => ['required', 'in:DNI,CE,PAS,CI,PTP'],
            'document_number' => [
                'required',
                'string',
                'max:20',
                Rule::unique('parents', 'document_number')
                    ->where('tenant_id', $tenantId)
            ],
            'name' => ['required', 'string', 'max:100'],
            'paternal_surname' => ['required', 'string', 'max:50'],
            'maternal_surname' => ['required', 'string', 'max:50'],
            'phone_number' => ['nullable', 'string', 'max:15'],
            'phone_number_secondary' => ['nullable', 'string', 'max:15'],
            'email' => [
                'nullable',
                'email',
                'max:100',
                Rule::unique('parents', 'email')
                    ->where('tenant_id', $tenantId)
            ],
            'address' => ['nullable', 'string', 'max:255'],
            'occupation' => ['nullable', 'string', 'max:100'],
            'workplace' => ['nullable', 'string', 'max:150'],
            'students' => ['nullable', 'array', 'max:10'],
            'students.*.student_id' => [
                'required',
                Rule::exists('students', 'id')
                    ->where('tenant_id', $tenantId)
            ],
            'students.*.relationship_type' => ['required', 'in:PADRE,MADRE,APODERADO'],
            'students.*.custom_relationship_label' => ['nullable', 'string', 'max:50'],
            'students.*.is_primary_contact' => ['boolean'],
            'students.*.receives_notifications' => ['boolean'],
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
            'document_type.required' => 'El tipo de documento es obligatorio.',
            'document_type.in' => 'El tipo de documento no es válido.',
            'document_number.required' => 'El número de documento es obligatorio.',
            'document_number.unique' => 'El número de documento ya está registrado en esta institución.',
            'name.required' => 'El nombre es obligatorio.',
            'name.max' => 'El nombre no puede tener más de 100 caracteres.',
            'paternal_surname.required' => 'El apellido paterno es obligatorio.',
            'maternal_surname.required' => 'El apellido materno es obligatorio.',
            'phone_number.max' => 'El número de teléfono no puede tener más de 15 caracteres.',
            'email.email' => 'El correo electrónico no es válido.',
            'email.unique' => 'El correo electrónico ya está registrado en esta institución.',
            'students.max' => 'No se pueden asignar más de 10 estudiantes a un apoderado.',
            'students.*.student_id.required' => 'El ID del estudiante es obligatorio.',
            'students.*.student_id.exists' => 'Uno de los estudiantes seleccionados no existe.',
            'students.*.relationship_type.required' => 'El tipo de relación es obligatorio.',
            'students.*.relationship_type.in' => 'El tipo de relación no es válido.',
        ];
    }
}
