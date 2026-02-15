<?php

namespace App\Http\Requests\Teachers;

use App\Constants\ValidationConstants;
use App\Validation\Messages;
use App\Validation\PasswordRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TeacherStoreRequest extends FormRequest
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
     * Creating a teacher will automatically create a user account.
     * Personal data validates against the users table.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $tenantId = $this->user()->tenant_id;

        return [
            'document_type' => ['required', ValidationConstants::DOCUMENT_TYPES_RULE],
            'document_number' => [
                'required',
                'string',
                'max:20',
                Rule::unique('users', 'document_number')
                    ->where('tenant_id', $tenantId)
            ],
            'name' => ['required', 'string', 'max:100'],
            'paternal_surname' => ['required', 'string', 'max:50'],
            'maternal_surname' => ['required', 'string', 'max:50'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')
                    ->where('tenant_id', $tenantId)
            ],
            'phone_number' => ['nullable', 'string', 'max:15'],
            'photo_url' => ['nullable', 'string', 'max:500'],
            'password' => PasswordRules::optional(),

            'level' => ['required', ValidationConstants::LEVELS_RULE],
            'specialty' => ['nullable', 'string', 'max:100'],
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
            ...Messages::document(),
            ...Messages::personName(),
            ...Messages::contact(),
            ...PasswordRules::messages(),
            ...Messages::teacher(),
        ];
    }
}
