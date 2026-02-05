<?php

namespace App\Validation;

use Illuminate\Validation\Rules\Password;

class PasswordRules
{
    /**
     * Get password rules for creating a new user account.
     * Password is required.
     */
    public static function required(): array
    {
        return ['required', self::baseRules()];
    }

    /**
     * Get password rules for updating an existing user account.
     * Password is optional but must meet requirements if provided.
     */
    public static function optional(): array
    {
        return ['sometimes', 'nullable', self::baseRules()];
    }

    /**
     * Get the base password validation rule.
     */
    private static function baseRules(): Password
    {
        return Password::min(8)
            ->mixedCase()
            ->numbers()
            ->symbols();
    }

    /**
     * Get custom error messages for password validation.
     */
    public static function messages(): array
    {
        return [
            'password.required' => 'La contraseña es obligatoria.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.mixed' => 'La contraseña debe incluir letras mayúsculas y minúsculas.',
            'password.numbers' => 'La contraseña debe incluir al menos un número.',
            'password.symbols' => 'La contraseña debe incluir al menos un símbolo (por ejemplo: @, #, $, %).',
        ];
    }
}
