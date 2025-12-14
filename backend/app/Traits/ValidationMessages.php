<?php

namespace App\Traits;

trait ValidationMessages
{
    public function defaultMessages(): array
    {
        return [
            'required' => 'El campo :attribute es obligatorio.',
            'string' => 'El campo :attribute debe ser un texto válido.',
            'max' => 'El campo :attribute no puede superar :max caracteres.',
            'min' => 'El campo :attribute debe tener al menos :min caracteres.',
            'email' => 'El campo :attribute debe ser un correo electrónico válido.',
            'unique' => 'El valor de :attribute ya está registrado.',
            'exists' => 'El valor seleccionado para :attribute no existe.',
            'in' => 'El valor seleccionado para :attribute no es válido.',
            'date' => 'El campo :attribute debe tener un formato de fecha válido.',
            'before' => 'El campo :attribute debe ser una fecha anterior a hoy.',
            'size' => 'El campo :attribute debe tener exactamente :size caracteres.',
            'boolean' => 'El campo :attribute debe ser verdadero o falso.',
            'numeric' => 'El campo :attribute debe ser un número válido.',
            'confirmed' => 'La confirmación de :attribute no coincide.',
        ];
    }
}
