<?php

namespace App\Http\Requests\Users;

use App\Traits\ValidationMessages;
use Illuminate\Foundation\Http\FormRequest;

class PadreStoreRequest extends FormRequest
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
            'document_type' => ['required', 'in:DNI,CE,PAS,CI,PTP'],
            'document_number' => ['required', 'string', 'max:20', 'unique:padres_apoderados,document_number'],
            'email' => ['nullable', 'email', 'max:255', 'unique:padres_apoderados,email'],
            'phone_number' => ['nullable', 'string', 'max:15'],
            'relationship_type' => ['required', 'in:PADRE,MADRE,APODERADO,TUTOR'],
        ];
    }

    public function messages(): array
    {
        return array_merge($this->defaultMessages(), [
            'document_number.unique' => 'El número de documento ya está registrado.',
            'email.unique' => 'El email ya está registrado.',
            'relationship_type.in' => 'El tipo de relación debe ser PADRE, MADRE, APODERADO o TUTOR.',
        ]);
    }
}