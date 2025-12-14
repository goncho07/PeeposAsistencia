<?php

namespace App\Http\Requests\Users;

use App\Traits\ValidationMessages;
use Illuminate\Foundation\Http\FormRequest;

class EstudianteStoreRequest extends FormRequest
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
            'student_code' => ['required', 'string', 'max:20', 'unique:estudiantes,student_code'],
            'name' => ['required', 'string', 'max:100'],
            'paternal_surname' => ['required', 'string', 'max:50'],
            'maternal_surname' => ['required', 'string', 'max:50'],
            'document_type' => ['required', 'in:DNI,CE,PAS,CI,PTP'],
            'document_number' => ['required', 'string', 'max:20', 'unique:estudiantes,document_number'],
            'gender' => ['required', 'in:M,F'],
            'date_of_birth' => ['required', 'date', 'before:today'],
            'aula_id' => ['required', 'exists:aulas,id'],
            'padre_id' => ['nullable', 'exists:padres,id'],
        ];
    }

    public function messages(): array
    {
        return array_merge($this->defaultMessages(), [
            'student_code.unique' => 'El código del estudiante ya está registrado.',
            'document_number.unique' => 'El número de documento ya está registrado.',
            'aula_id.exists' => 'El aula seleccionada no existe.',
            'padre_id.exists' => 'El apoderado seleccionado no existe.',
            'date_of_birth.before' => 'La fecha de nacimiento debe ser anterior a hoy.',
        ]);
    }
}
