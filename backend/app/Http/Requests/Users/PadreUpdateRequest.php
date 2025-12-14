<?php

namespace App\Http\Requests\Users;

use App\Traits\ValidationMessages;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PadreUpdateRequest extends FormRequest
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
        $padreId = $this->route('id');

        return [
            'name' => ['sometimes', 'string', 'max:100'],
            'paternal_surname' => ['sometimes', 'string', 'max:50'],
            'maternal_surname' => ['sometimes', 'string', 'max:50'],
            'document_type' => ['sometimes', 'in:DNI,CE,PAS,CI,PTP'],
            'document_number' => [
                'sometimes',
                'string',
                'max:20',
                Rule::unique('padres_apoderados', 'document_number')->ignore($padreId),
            ],
            'email' => [
                'nullable',
                'email',
                'max:255',
                Rule::unique('padres_apoderados', 'email')->ignore($padreId),
            ],
            'phone_number' => ['nullable', 'string', 'max:15'],
            'relationship_type' => ['sometimes', 'in:PADRE,MADRE,APODERADO,TUTOR'],
        ];
    }

    public function messages(): array
    {
        return array_merge($this->defaultMessages(), [
            'document_number.unique' => 'El número de documento ya está registrado.',
            'email.unique' => 'El correo electrónico ya está registrado.',
            'relationship_type.in' => 'El tipo de relación debe ser PADRE, MADRE, APODERADO o TUTOR.',
        ]);
    }
}
