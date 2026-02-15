<?php

namespace App\Http\Requests\Students;

use App\Constants\ValidationConstants;
use App\Validation\Messages;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StudentStoreRequest extends FormRequest
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
            'student_code' => [
                'required',
                'string',
                'max:20',
                Rule::unique('students', 'student_code')
                    ->where('tenant_id', $tenantId)
            ],
            'document_type' => ['required', ValidationConstants::DOCUMENT_TYPES_RULE],
            'document_number' => [
                'required',
                'string',
                'max:20',
                Rule::unique('students', 'document_number')
                    ->where('tenant_id', $tenantId)
            ],
            'name' => ['required', 'string', 'max:100'],
            'paternal_surname' => ['required', 'string', 'max:50'],
            'maternal_surname' => ['required', 'string', 'max:50'],
            'gender' => ['required', ValidationConstants::GENDERS_RULE],
            'birth_date' => ['required', 'date', 'before:today'],
            'birth_place' => ['nullable', 'string', 'max:100'],
            'nationality' => ['nullable', 'string', 'max:50'],
            'classroom_id' => [
                'required',
                Rule::exists('classrooms', 'id')
                    ->where('tenant_id', $tenantId)
            ],

            'academic_year' => ['nullable', 'integer', 'min:2020', 'max:2099'],
            'address' => ['nullable', 'string', 'max:255'],
            'emergency_contact_name' => ['nullable', 'string', 'max:150'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:15'],
            'photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:5120'],
            'parents' => ['nullable', 'array', 'max:4'],
            'parents.*.parent_id' => [
                'required',
                Rule::exists('parents', 'id')
                    ->where('tenant_id', $tenantId)
            ],
            'parents.*.relationship_type' => ['required', ValidationConstants::RELATIONSHIP_TYPES_RULE],
            'parents.*.custom_relationship_label' => ['nullable', 'string', 'max:50'],
            'parents.*.is_primary_contact' => ['boolean'],
            'parents.*.receives_notifications' => ['boolean'],
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
            ...Messages::student(),
            ...Messages::parentRelationship(),
        ];
    }
}
