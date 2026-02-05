<?php

namespace App\Http\Requests\Teachers;

use App\Constants\ValidationConstants;
use App\Models\Teacher;
use App\Validation\Messages;
use App\Validation\PasswordRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TeacherUpdateRequest extends FormRequest
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
     * Updating a teacher will also update the linked user account.
     * Personal data validates against the users table.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $tenantId = $this->user()->tenant_id;
        $teacherId = $this->route('id');

        $teacher = Teacher::find($teacherId);
        $userId = $teacher?->user_id;

        return [
            'document_type' => ['sometimes', ValidationConstants::DOCUMENT_TYPES_RULE],
            'document_number' => [
                'sometimes',
                'required',
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
            'phone_number' => ['sometimes', 'nullable', 'string', 'max:15'],
            'photo_url' => ['sometimes', 'nullable', 'string', 'max:500'],
            'password' => PasswordRules::optional(),

            'level' => ['sometimes', 'required', ValidationConstants::LEVELS_RULE],
            'specialty' => ['sometimes', 'nullable', 'string', 'max:100'],
            'contract_type' => ['sometimes', 'nullable', ValidationConstants::CONTRACT_TYPES_RULE],
            'hire_date' => ['sometimes', 'nullable', 'date'],
            'status' => ['sometimes', ValidationConstants::TEACHER_STATUSES_RULE],
            'qr_code' => [
                'sometimes',
                'string',
                'max:50',
                Rule::unique('teachers', 'qr_code')
                    ->where('tenant_id', $tenantId)
                    ->ignore($teacherId)
            ],
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
