<?php

namespace App\Http\Requests\Users;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UserUpdateRequest extends FormRequest
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
        $userId = $this->route('user');

        return [
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'paternal_surname' => ['sometimes', 'required', 'string', 'max:50'],
            'maternal_surname' => ['sometimes', 'required', 'string', 'max:50'],
            'dni' => [
                'sometimes',
                'required',
                'string',
                'digits:8',
                Rule::unique('users', 'dni')
                    ->where('tenant_id', $tenantId)
                    ->ignore($userId)
            ],
            'email' => [
                'sometimes',
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')
                    ->where('tenant_id', $tenantId)
                    ->ignore($userId)
            ],
            'password' => ['sometimes', Password::min(8)->mixedCase()->numbers()->symbols()],
            'role' => ['required', 'in:SUPERADMIN,DIRECTOR,SUBDIRECTOR,SECRETARIO,ESCANER,COORDINADOR'],
            'phone_number' => ['sometimes', 'nullable', 'string', 'max:15'],
            'avatar_url' => ['sometimes', 'nullable', 'url', 'max:500'],
            'status' => ['sometimes', 'in:ACTIVO,INACTIVO'],
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
            'dni.required' => 'El DNI es obligatorio.',
            'dni.digits' => 'El DNI debe tener exactamente 8 dígitos.',
            'dni.unique' => 'El DNI ya está registrado en esta institución.',
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'El correo electrónico no es válido.',
            'email.unique' => 'El correo electrónico ya está registrado en esta institución.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'role.required' => 'El rol es obligatorio.',
            'role.in' => 'El rol no es válido.',
            'phone_number.max' => 'El número de teléfono no puede tener más de 15 caracteres.',
            'status.in' => 'El estado no es válido.',
        ];
    }
}