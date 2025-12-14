<?php

namespace App\Http\Requests\Users;

use App\Traits\ValidationMessages;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DocenteUpdateRequest extends FormRequest
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
        $docenteId = $this->route('id');

        return [
            'name' => ['sometimes', 'string', 'max:100'],
            'paternal_surname' => ['sometimes', 'string', 'max:50'],
            'maternal_surname' => ['sometimes', 'string', 'max:50'],
            'dni' => [
                'sometimes',
                'string',
                'size:8',
                Rule::unique('docentes', 'dni')->ignore($docenteId),
            ],
            'email' => [
                'nullable',
                'string',
                'email:rfc,dns',
                'max:255',
                Rule::unique('docentes', 'email')->ignore($docenteId),
            ],
            'phone_number' => ['nullable', 'string', 'max:15'],
            'area' => ['sometimes', 'string', 'max:30'],
            'nivel' => ['sometimes', 'string', 'in:INICIAL,PRIMARIA,SECUNDARIA'],
        ];
    }

    public function messages(): array
    {
        return array_merge($this->defaultMessages(), [
            'dni.unique' => 'El DNI ya está registrado.',
            'email.unique' => 'El correo electrónico ya está registrado.',
            'nivel.in' => 'El nivel debe ser INICIAL, PRIMARIA o SECUNDARIA.',
        ]);
    }
}
