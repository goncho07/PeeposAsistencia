<?php

namespace App\Http\Requests\Parents;

use App\Constants\ValidationConstants;
use App\Validation\Messages;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ParentUpdateRequest extends FormRequest
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
        $parentId = $this->route('id');

        return [
            'document_type' => ['sometimes', 'required', ValidationConstants::DOCUMENT_TYPES_RULE],
            'document_number' => [
                'sometimes',
                'required',
                'string',
                'max:20',
                Rule::unique('parents', 'document_number')
                    ->where('tenant_id', $tenantId)
                    ->ignore($parentId)
            ],
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'paternal_surname' => ['sometimes', 'required', 'string', 'max:50'],
            'maternal_surname' => ['sometimes', 'required', 'string', 'max:50'],
            'phone_number' => ['sometimes', 'nullable', 'string', 'max:15'],
            'phone_number_secondary' => ['sometimes', 'nullable', 'string', 'max:15'],
            'email' => [
                'sometimes',
                'nullable',
                'email',
                'max:100',
                Rule::unique('parents', 'email')
                    ->where('tenant_id', $tenantId)
                    ->ignore($parentId)
            ],
            'address' => ['sometimes', 'nullable', 'string', 'max:255'],
            'occupation' => ['sometimes', 'nullable', 'string', 'max:100'],
            'workplace' => ['sometimes', 'nullable', 'string', 'max:150'],
            'students' => ['sometimes', 'array', 'max:10'],
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
