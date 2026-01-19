<?php

namespace App\Http\Requests\Incidents;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Incident;

class IncidentUpdateRequest extends FormRequest
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
            'classroom_id' => 'sometimes|exists:classrooms,id',
            'student_id' => 'sometimes|exists:students,id',
            'date' => 'sometimes|date|before_or_equal:today',
            'time' => 'sometimes|date_format:H:i',
            'type' => 'sometimes|in:' . implode(',', array_keys(Incident::TYPES)),
            'severity' => 'sometimes|in:' . implode(',', array_keys(Incident::SEVERITIES)),
            'description' => 'nullable|string|max:1000',
            'status' => 'sometimes|in:' . implode(',', array_keys(Incident::STATUSES)),
            'resolution_notes' => 'nullable|string|max:1000',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'classroom_id.exists' => 'El aula seleccionada no existe',
            'student_id.exists' => 'El estudiante seleccionado no existe',
            'date.date' => 'La fecha no es válida',
            'date.before_or_equal' => 'La fecha no puede ser futura',
            'time.date_format' => 'El formato de hora no es válido (use HH:MM)',
            'type.in' => 'El tipo de incidencia no es válido',
            'severity.in' => 'La gravedad seleccionada no es válida',
            'status.in' => 'El estado seleccionado no es válido',
            'description.max' => 'La descripción no puede exceder 1000 caracteres',
            'resolution_notes.max' => 'Las notas de resolución no pueden exceder 1000 caracteres',
        ];
    }
}
