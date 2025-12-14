<?php

namespace App\Http\Requests\Users;

use App\Traits\ValidationMessages;
use Illuminate\Foundation\Http\FormRequest;

class DocenteStoreRequest extends FormRequest
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
            'dni' => ['required', 'string', 'size:8', 'unique:docentes,dni'],
            'email' => ['nullable', 'string', 'email:rfc,dns', 'max:255', 'unique:docentes,email'],
            'phone_number' => ['nullable', 'string', 'max:15'],
            'area' => ['required', 'string', 'max:30'],
            'nivel' => ['required', 'string', 'in:INICIAL,PRIMARIA,SECUNDARIA'],
        ];
    }

    public function messages(): array
    {
        return array_merge($this->defaultMessages(), [
            'dni.unique' => 'El DNI ya está registrado.',
            'dni.size' => 'El DNI debe tener exactamente 8 dígitos.',
            'email.unique' => 'El correo electrónico ya está registrado.',
            'nivel.in' => 'El nivel debe ser INICIAL, PRIMARIA o SECUNDARIA.',
        ]);
    }
}
