<?php

namespace App\Http\Requests\Teachers;

use App\Models\Teacher;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TeacherUpdateRequest extends FormRequest
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
     * Updating a teacher will also update the linked user account.
     * Personal data validates against the users table.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $tenantId = $this->user()->tenant_id;
        $teacherId = $this->route('id');

        // Get the user_id from the teacher to properly ignore in unique checks
        $teacher = Teacher::find($teacherId);
        $userId = $teacher?->user_id;

        return [
            // Personal data (for User update)
            'document_type' => ['sometimes', 'in:DNI,CE,PAS,CI,PTP'],
            'document_number' => [
                'sometimes',
                'required',
                'string',
                'max:20',
                Rule::unique('users', 'document_number')
                    ->where('tenant_id', $tenantId)
                    ->ignore($userId)
            ],
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'paternal_surname' => ['sometimes', 'required', 'string', 'max:50'],
            'maternal_surname' => ['sometimes', 'required', 'string', 'max:50'],
            'email' => [
                'sometimes',
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')
                    ->where('tenant_id', $tenantId)
                    ->ignore($userId)
            ],
            'phone_number' => ['sometimes', 'nullable', 'string', 'max:15'],
            'photo_url' => ['sometimes', 'nullable', 'string', 'max:500'],
            'password' => ['sometimes', 'nullable', 'string', 'min:6', 'max:100'],

            // Teacher-specific data
            'level' => ['sometimes', 'required', 'in:INICIAL,PRIMARIA,SECUNDARIA'],
            'specialty' => ['sometimes', 'nullable', 'string', 'max:100'],
            'contract_type' => ['sometimes', 'nullable', 'in:NOMBRADO,CONTRATADO,CAS,PRACTICANTE'],
            'hire_date' => ['sometimes', 'nullable', 'date'],
            'status' => ['sometimes', 'in:ACTIVO,INACTIVO,LICENCIA,CESADO'],
            'qr_code' => [
                'sometimes',
                'string',
                'max:50',
                Rule::unique('teachers', 'qr_code')
                    ->where('tenant_id', $tenantId)
                    ->ignore($teacherId)
            ],
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
            'document_type.in' => 'El tipo de documento no es válido.',
            'document_number.required' => 'El número de documento es obligatorio.',
            'document_number.unique' => 'El número de documento ya está registrado como usuario en esta institución.',
            'name.required' => 'El nombre es obligatorio.',
            'name.max' => 'El nombre no puede tener más de 100 caracteres.',
            'paternal_surname.required' => 'El apellido paterno es obligatorio.',
            'maternal_surname.required' => 'El apellido materno es obligatorio.',
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'El correo electrónico no es válido.',
            'email.unique' => 'El correo electrónico ya está registrado en esta institución.',
            'password.min' => 'La contraseña debe tener al menos 6 caracteres.',
            'level.required' => 'El nivel es obligatorio.',
            'level.in' => 'El nivel no es válido. Debe ser INICIAL, PRIMARIA o SECUNDARIA.',
            'specialty.max' => 'La especialidad no puede tener más de 100 caracteres.',
            'contract_type.in' => 'El tipo de contrato no es válido.',
            'status.in' => 'El estado no es válido.',
            'qr_code.unique' => 'El código QR ya está asignado a otro docente.',
        ];
    }
}
