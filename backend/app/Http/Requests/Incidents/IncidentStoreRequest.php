<?php

namespace App\Http\Requests\Incidents;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Incident;

class IncidentStoreRequest extends FormRequest
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
     */
    public function rules(): array
    {
        return [
            'classroom_id' => 'required|exists:classrooms,id',
            'student_id' => 'required|exists:students,id',
            'date' => 'required|date|before_or_equal:today',
            'time' => 'required|date_format:H:i',
            'type' => 'required|in:' . implode(',', array_keys(Incident::TYPES)),
            'severity' => 'required|in:' . implode(',', array_keys(Incident::SEVERITIES)),
            'description' => 'nullable|string|max:1000',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'classroom_id.required' => 'El aula es requerida',
            'classroom_id.exists' => 'El aula seleccionada no existe',
            'student_id.required' => 'El estudiante es requerido',
            'student_id.exists' => 'El estudiante seleccionado no existe',
            'date.required' => 'La fecha es requerida',
            'date.date' => 'La fecha no es válida',
            'date.before_or_equal' => 'La fecha no puede ser futura',
            'time.required' => 'La hora es requerida',
            'time.date_format' => 'El formato de hora no es válido (use HH:MM)',
            'type.required' => 'El tipo de incidencia es requerido',
            'type.in' => 'El tipo de incidencia no es válido',
            'severity.required' => 'La gravedad es requerida',
            'severity.in' => 'La gravedad seleccionada no es válida',
            'description.max' => 'La descripción no puede exceder 1000 caracteres',
        ];
    }
}
