<?php

namespace App\Http\Requests\Import;

use Illuminate\Foundation\Http\FormRequest;

class ImportExecuteRequest extends FormRequest
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
            'type' => ['required', 'in:students,teachers,classrooms'],
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:10240'],
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
            'type.required' => 'El tipo de importación es obligatorio.',
            'type.in' => 'El tipo de importación debe ser: students, teachers o classrooms.',
            'file.required' => 'El archivo es obligatorio.',
            'file.file' => 'Debe subir un archivo válido.',
            'file.mimes' => 'El archivo debe ser de tipo CSV.',
            'file.max' => 'El archivo no puede superar los 10MB.',
        ];
    }
}
