<?php

namespace App\Http\Requests\Users;

use App\Constants\ValidationConstants;
use App\Validation\Messages;
use App\Validation\PasswordRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserUpdateRequest extends FormRequest
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
        $tenantId = $this->user()->tenant_id;
        $userId = $this->route('id');

        return [
            'document_type' => ['sometimes', ValidationConstants::DOCUMENT_TYPES_RULE],
            'document_number' => [
                'sometimes',
                'nullable',
                'string',
                'max:20',
                Rule::unique('users', 'document_number')
                    ->where('tenant_id', $tenantId)
                    ->ignore($userId)
            ],
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'paternal_surname' => ['sometimes', 'required', 'string', 'max:50'],
            'maternal_surname' => ['sometimes', 'required', 'string', 'max:50'],
            'email' => [
                'sometimes',
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')
                    ->where('tenant_id', $tenantId)
                    ->ignore($userId)
            ],
            'password' => PasswordRules::optional(),
            'role' => ['sometimes', ValidationConstants::USER_ROLES_RULE],
            'phone_number' => ['sometimes', 'nullable', 'string', 'max:15'],
            'photo_url' => ['sometimes', 'nullable', 'string', 'max:500'],
            'status' => ['sometimes', ValidationConstants::USER_STATUSES_RULE],
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
            ...Messages::userRole(),
        ];
    }
}