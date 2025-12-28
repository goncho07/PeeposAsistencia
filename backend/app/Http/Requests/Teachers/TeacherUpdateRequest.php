<?php

namespace App\Http\Requests\Teachers;

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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $tenantId = $this->user()->tenant_id;
        $teacherId = $this->route('teacher');

        return [
            'dni' => [
                'sometimes',
                'required',
                'string',
                'digits:8',
                Rule::unique('teachers', 'dni')
                    ->where('tenant_id', $tenantId)
                    ->ignore($teacherId)
            ],
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'paternal_surname' => ['sometimes', 'required', 'string', 'max:50'],
            'maternal_surname' => ['sometimes', 'required', 'string', 'max:50'],
            'birth_date' => ['sometimes', 'nullable', 'date', 'before:today'],
            'level' => ['sometimes', 'required', 'in:INICIAL,PRIMARIA,SECUNDARIA'],
            'area' => ['sometimes', 'nullable', 'string', 'max:30'],
            'email' => [
                'sometimes',
                'nullable',
                'email',
                'max:255',
                Rule::unique('teachers', 'email')
                    ->where('tenant_id', $tenantId)
                    ->ignore($teacherId)
            ],
            'phone_number' => ['sometimes', 'nullable', 'string', 'max:15'],
            'status' => ['sometimes', 'in:ACTIVO,INACTIVO,LICENCIA,CESADO'],
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
            'dni.required' => 'El DNI es obligatorio.',
            'dni.digits' => 'El DNI debe tener exactamente 8 dígitos.',
            'dni.unique' => 'El DNI ya está registrado en esta institución.',
            'name.required' => 'El nombre es obligatorio.',
            'name.max' => 'El nombre no puede tener más de 100 caracteres.',
            'paternal_surname.required' => 'El apellido paterno es obligatorio.',
            'maternal_surname.required' => 'El apellido materno es obligatorio.',
            'birth_date.before' => 'La fecha de nacimiento debe ser anterior a hoy.',
            'level.required' => 'El nivel es obligatorio.',
            'level.in' => 'El nivel no es válido. Debe ser INICIAL, PRIMARIA o SECUNDARIA.',
            'email.email' => 'El correo electrónico no es válido.',
            'email.unique' => 'El correo electrónico ya está registrado en esta institución.',
            'phone_number.max' => 'El número de teléfono no puede tener más de 15 caracteres.',
            'status.in' => 'El estado no es válido.',
        ];
    }
}
