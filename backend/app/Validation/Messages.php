<?php

namespace App\Validation;

/**
 * Centralized validation messages for common fields.
 * Use spread operator to merge: [...Messages::document(), ...Messages::personName()]
 */
class Messages
{
    /**
     * Messages for document fields (document_type, document_number).
     */
    public static function document(): array
    {
        return [
            'document_type.required' => 'El tipo de documento es obligatorio.',
            'document_type.in' => 'El tipo de documento no es válido.',
            'document_number.required' => 'El número de documento es obligatorio.',
            'document_number.unique' => 'El número de documento ya está registrado en esta institución.',
            'document_number.max' => 'El número de documento no puede tener más de 20 caracteres.',
        ];
    }

    /**
     * Messages for person name fields (name, paternal_surname, maternal_surname).
     */
    public static function personName(): array
    {
        return [
            'name.required' => 'El nombre es obligatorio.',
            'name.max' => 'El nombre no puede tener más de 100 caracteres.',
            'paternal_surname.required' => 'El apellido paterno es obligatorio.',
            'paternal_surname.max' => 'El apellido paterno no puede tener más de 50 caracteres.',
            'maternal_surname.required' => 'El apellido materno es obligatorio.',
            'maternal_surname.max' => 'El apellido materno no puede tener más de 50 caracteres.',
        ];
    }

    /**
     * Messages for contact fields (email, phone_number).
     */
    public static function contact(): array
    {
        return [
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'El correo electrónico no es válido.',
            'email.unique' => 'El correo electrónico ya está registrado en esta institución.',
            'email.max' => 'El correo electrónico no puede tener más de 255 caracteres.',
            'phone_number.max' => 'El número de teléfono no puede tener más de 15 caracteres.',
        ];
    }

    /**
     * Messages for student-specific fields.
     */
    public static function student(): array
    {
        return [
            'student_code.required' => 'El código del estudiante es obligatorio.',
            'student_code.unique' => 'El código del estudiante ya está registrado en esta institución.',
            'gender.required' => 'El género es obligatorio.',
            'gender.in' => 'El género no es válido.',
            'birth_date.required' => 'La fecha de nacimiento es obligatoria.',
            'birth_date.date' => 'La fecha de nacimiento no es válida.',
            'birth_date.before' => 'La fecha de nacimiento debe ser anterior a hoy.',
            'classroom_id.required' => 'El aula es obligatoria.',
            'classroom_id.exists' => 'El aula seleccionada no existe o está inactiva.',
        ];
    }

    /**
     * Messages for teacher-specific fields.
     */
    public static function teacher(): array
    {
        return [
            'level.required' => 'El nivel es obligatorio.',
            'level.in' => 'El nivel no es válido. Debe ser INICIAL, PRIMARIA o SECUNDARIA.',
            'specialty.max' => 'La especialidad no puede tener más de 100 caracteres.',
            'qr_code.unique' => 'El código QR ya está asignado a otro docente.',
        ];
    }

    /**
     * Messages for classroom fields.
     */
    public static function classroom(): array
    {
        return [
            'tutor_id.exists' => 'El tutor seleccionado no existe o está inactivo.',
            'level.required' => 'El nivel es obligatorio.',
            'level.in' => 'El nivel debe ser INICIAL, PRIMARIA o SECUNDARIA.',
            'grade.required' => 'El grado es obligatorio.',
            'grade.integer' => 'El grado debe ser un número.',
            'grade.min' => 'El grado debe ser al menos 1.',
            'grade.max' => 'El grado no puede ser mayor a 6.',
            'section.required' => 'La sección es obligatoria.',
            'section.max' => 'La sección no puede tener más de 10 caracteres.',
            'shift.in' => 'El turno debe ser MAÑANA, TARDE o NOCHE.',
            'room_number.max' => 'El número de aula no puede tener más de 20 caracteres.',
            'capacity.integer' => 'La capacidad debe ser un número.',
            'capacity.min' => 'La capacidad debe ser al menos 1.',
            'capacity.max' => 'La capacidad no puede ser mayor a 100.',
            'status.in' => 'El estado no es válido.',
        ];
    }

    /**
     * Messages for parent-student relationship fields.
     */
    public static function parentRelationship(): array
    {
        return [
            'parents.max' => 'No se pueden asignar más de 4 apoderados a un estudiante.',
            'parents.*.parent_id.required' => 'El ID del apoderado es obligatorio.',
            'parents.*.parent_id.exists' => 'Uno de los apoderados seleccionados no existe.',
            'parents.*.relationship_type.required' => 'El tipo de relación es obligatorio.',
            'parents.*.relationship_type.in' => 'El tipo de relación no es válido.',
        ];
    }

    /**
     * Messages for student-parent relationship fields (from parent perspective).
     */
    public static function studentRelationship(): array
    {
        return [
            'students.max' => 'No se pueden asignar más de 10 estudiantes a un apoderado.',
            'students.*.student_id.required' => 'El ID del estudiante es obligatorio.',
            'students.*.student_id.exists' => 'Uno de los estudiantes seleccionados no existe.',
            'students.*.relationship_type.required' => 'El tipo de relación es obligatorio.',
            'students.*.relationship_type.in' => 'El tipo de relación no es válido.',
        ];
    }

    /**
     * Messages for user role and status fields.
     */
    public static function userRole(): array
    {
        return [
            'role.required' => 'El rol es obligatorio.',
            'role.in' => 'El rol no es válido.',
            'status.in' => 'El estado no es válido.',
        ];
    }
}
