<?php

namespace App\Http\Requests\Teachers;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TeacherStoreRequest extends FormRequest
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
     * Creating a teacher will automatically create a user account.
     * Personal data validates against the users table.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $tenantId = $this->user()->tenant_id;

        return [
            // Personal data (for User creation)
            'document_type' => ['required', 'in:DNI,CE,PAS,CI,PTP'],
            'document_number' => [
                'required',
                'string',
                'max:20',
                Rule::unique('users', 'document_number')
                    ->where('tenant_id', $tenantId)
            ],
            'name' => ['required', 'string', 'max:100'],
            'paternal_surname' => ['required', 'string', 'max:50'],
            'maternal_surname' => ['required', 'string', 'max:50'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')
                    ->where('tenant_id', $tenantId)
            ],
            'phone_number' => ['nullable', 'string', 'max:15'],
            'photo_url' => ['nullable', 'string', 'max:500'],
            'password' => ['nullable', 'string', 'min:6', 'max:100'],

            // Teacher-specific data
            'level' => ['required', 'in:INICIAL,PRIMARIA,SECUNDARIA'],
            'specialty' => ['nullable', 'string', 'max:100'],
            'contract_type' => ['nullable', 'in:NOMBRADO,CONTRATADO,CAS,PRACTICANTE'],
            'hire_date' => ['nullable', 'date'],
            'status' => ['nullable', 'in:ACTIVO,INACTIVO,LICENCIA,CESADO'],
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
            'document_number.unique' => 'El número de documento ya está registrado como usuario en esta institución.',
            'name.required' => 'El nombre es obligatorio.',
            'name.max' => 'El nombre no puede tener más de 100 caracteres.',
            'paternal_surname.required' => 'El apellido paterno es obligatorio.',
            'maternal_surname.required' => 'El apellido materno es obligatorio.',
            'email.required' => 'El correo electrónico es obligatorio para crear la cuenta de acceso.',
            'email.email' => 'El correo electrónico no es válido.',
            'email.unique' => 'El correo electrónico ya está registrado en esta institución.',
            'password.min' => 'La contraseña debe tener al menos 6 caracteres.',
            'level.required' => 'El nivel es obligatorio.',
            'level.in' => 'El nivel no es válido. Debe ser INICIAL, PRIMARIA o SECUNDARIA.',
            'specialty.max' => 'La especialidad no puede tener más de 100 caracteres.',
            'contract_type.in' => 'El tipo de contrato no es válido.',
            'status.in' => 'El estado no es válido.',
        ];
    }
}
