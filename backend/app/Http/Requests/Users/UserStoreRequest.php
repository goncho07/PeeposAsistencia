<?php

namespace App\Http\Requests\Users;

use App\Traits\ValidationMessages;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class UserStoreRequest extends FormRequest
{
    use ValidationMessages;

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
        return [
            'name' => ['required', 'string', 'max:100'],
            'paternal_surname' => ['required', 'string', 'max:50'],
            'maternal_surname' => ['required', 'string', 'max:50'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', Password::min(8)->mixedCase()->numbers()],
            'dni' => ['required', 'string', 'size:8', 'unique:users,dni'],
            'phone_number' => ['nullable', 'string', 'max:15'],
            'rol' => ['required', 'in:DIRECTOR,SUBDIRECTOR,SECRETARIO,ESCANER'],
            'status' => ['sometimes', 'in:ACTIVO,INACTIVO'],
        ];
    }

    public function messages(): array
    {
        return array_merge($this->defaultMessages(), [
            'dni.unique' => 'El DNI ya está registrado.',
            'dni.size' => 'El DNI debe tener exactamente 8 dígitos.',
            'email.unique' => 'El correo electrónico ya está registrado.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.mixedCase' => 'La contraseña debe incluir mayúsculas y minúsculas.',
            'password.numbers' => 'La contraseña debe incluir al menos un número.',
            'rol.in' => 'El rol seleccionado no es válido.',
        ]);
    }
}
