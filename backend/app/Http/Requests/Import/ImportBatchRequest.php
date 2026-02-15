<?php

namespace App\Http\Requests\Import;

use Illuminate\Foundation\Http\FormRequest;

class ImportBatchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:10240'],
            'offset' => ['required', 'integer', 'min:0'],
            'batch_size' => ['required', 'integer', 'min:10', 'max:200'],
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => 'El archivo es obligatorio.',
            'file.file' => 'Debe subir un archivo válido.',
            'file.mimes' => 'El archivo debe ser de tipo CSV.',
            'file.max' => 'El archivo no puede superar los 10MB.',
            'offset.required' => 'El offset es obligatorio.',
            'offset.integer' => 'El offset debe ser un número entero.',
            'batch_size.required' => 'El tamaño de lote es obligatorio.',
            'batch_size.integer' => 'El tamaño de lote debe ser un número entero.',
        ];
    }
}
