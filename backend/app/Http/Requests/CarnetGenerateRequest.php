<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CarnetGenerateRequest extends FormRequest
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
        return [
            'users' => ['required', 'array', 'min:1'],
            'users.*.id' => ['required', 'integer', 'min:1'],
            'users.*.type' => ['required', 'string', 'in:student,teacher'],
        ];
    }

    public function messages(): array
    {
        return [
            'users.required' => 'Debe seleccionar al menos un usuario',
            'users.array' => 'El formato de usuarios es inválido',
            'users.min' => 'Debe seleccionar al menos un usuario',
            'users.*.id.required' => 'El ID del usuario es requerido',
            'users.*.id.integer' => 'El ID del usuario debe ser un número',
            'users.*.type.required' => 'El tipo de usuario es requerido',
            'users.*.type.in' => 'El tipo de usuario debe ser student o teacher',
        ];
    }

    public function attributes(): array
    {
        return [
            'users' => 'lista de usuarios',
            'users.*.id' => 'ID del usuario',
            'users.*.type' => 'tipo de usuario',
        ];
    }
}
