<?php

namespace App\Http\Requests\Users;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UserStoreRequest extends FormRequest
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
                'nullable',
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
            'password' => ['required', Password::min(8)->mixedCase()->numbers()->symbols()],
            'role' => ['required', 'in:SUPERADMIN,DIRECTOR,SUBDIRECTOR,SECRETARIO,COORDINADOR,AUXILIAR,DOCENTE,ESCANER'],
            'phone_number' => ['nullable', 'string', 'max:15'],
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
            'document_number.unique' => 'El número de documento ya está registrado en esta institución.',
            'name.required' => 'El nombre es obligatorio.',
            'name.max' => 'El nombre no puede tener más de 100 caracteres.',
            'paternal_surname.required' => 'El apellido paterno es obligatorio.',
            'maternal_surname.required' => 'El apellido materno es obligatorio.',
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'El correo electrónico no es válido.',
            'email.unique' => 'El correo electrónico ya está registrado en esta institución.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.mixed' => 'La contraseña debe incluir letras mayúsculas y minúsculas.',
            'password.numbers' => 'La contraseña debe incluir al menos un número.',
            'password.symbols' => 'La contraseña debe incluir al menos un símbolo (por ejemplo: @, #, $, %).',
            'role.required' => 'El rol es obligatorio.',
            'role.in' => 'El rol no es válido.',
            'phone_number.max' => 'El número de teléfono no puede tener más de 15 caracteres.',
        ];
    }
}