<?php

namespace App\Http\Requests\Users;

use App\Traits\ValidationMessages;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UserUpdateRequest extends FormRequest
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
        $userId = $this->route('id');

        return [
            'name' => ['sometimes', 'string', 'max:100'],
            'paternal_surname' => ['sometimes', 'string', 'max:50'],
            'maternal_surname' => ['sometimes', 'string', 'max:50'],
            'email' => [
                'sometimes',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'password' => ['nullable', Password::min(8)->mixedCase()->numbers()],
            'dni' => [
                'sometimes',
                'string',
                'size:8',
                Rule::unique('users', 'dni')->ignore($userId),
            ],
            'phone_number' => ['nullable', 'string', 'max:15'],
            'rol' => ['sometimes', 'in:DIRECTOR,SUBDIRECTOR,SECRETARIO,ESCANER'],
            'status' => ['sometimes', 'in:ACTIVO,INACTIVO'],
        ];
    }

    public function messages(): array
    {
        return array_merge($this->defaultMessages(), [
            'dni.unique' => 'El DNI ya está registrado.',
            'email.unique' => 'El correo electrónico ya está registrado.',
        ]);
    }
}
