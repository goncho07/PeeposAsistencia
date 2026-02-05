<?php

namespace App\Http\Requests\Parents;

use App\Constants\ValidationConstants;
use App\Validation\Messages;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ParentStoreRequest extends FormRequest
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

        return [
            'document_type' => ['required', ValidationConstants::DOCUMENT_TYPES_RULE],
            'document_number' => [
                'required',
                'string',
                'max:20',
                Rule::unique('parents', 'document_number')
                    ->where('tenant_id', $tenantId)
            ],
            'name' => ['required', 'string', 'max:100'],
            'paternal_surname' => ['required', 'string', 'max:50'],
            'maternal_surname' => ['required', 'string', 'max:50'],
            'phone_number' => ['nullable', 'string', 'max:15'],
            'phone_number_secondary' => ['nullable', 'string', 'max:15'],
            'email' => [
                'nullable',
                'email',
                'max:100',
                Rule::unique('parents', 'email')
                    ->where('tenant_id', $tenantId)
            ],
            'address' => ['nullable', 'string', 'max:255'],
            'occupation' => ['nullable', 'string', 'max:100'],
            'workplace' => ['nullable', 'string', 'max:150'],
            'students' => ['nullable', 'array', 'max:10'],
            'students.*.student_id' => [
                'required',
                Rule::exists('students', 'id')
                    ->where('tenant_id', $tenantId)
            ],
            'students.*.relationship_type' => ['required', ValidationConstants::RELATIONSHIP_TYPES_RULE],
            'students.*.custom_relationship_label' => ['nullable', 'string', 'max:50'],
            'students.*.is_primary_contact' => ['boolean'],
            'students.*.receives_notifications' => ['boolean'],
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
            ...Messages::studentRelationship(),
        ];
    }
}
