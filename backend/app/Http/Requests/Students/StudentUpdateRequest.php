<?php

namespace App\Http\Requests\Students;

use App\Constants\ValidationConstants;
use App\Validation\Messages;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StudentUpdateRequest extends FormRequest
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
        $studentId = $this->route('id');

        return [
            'document_type' => ['sometimes', 'required', ValidationConstants::DOCUMENT_TYPES_RULE],
            'document_number' => [
                'sometimes',
                'required',
                'string',
                'max:20',
                Rule::unique('students', 'document_number')
                    ->where('tenant_id', $tenantId)
                    ->ignore($studentId)
            ],
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'paternal_surname' => ['sometimes', 'required', 'string', 'max:50'],
            'maternal_surname' => ['sometimes', 'required', 'string', 'max:50'],
            'gender' => ['sometimes', ValidationConstants::GENDERS_RULE],
            'birth_date' => ['sometimes', 'required', 'date', 'before:today'],
            'birth_place' => ['sometimes', 'nullable', 'string', 'max:100'],
            'nationality' => ['sometimes', 'nullable', 'string', 'max:50'],
            'photo' => ['sometimes', 'nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:5120'],
            'classroom_id' => [
                'sometimes',
                'required',
                Rule::exists('classrooms', 'id')
                    ->where('tenant_id', $tenantId)
                    ->where('status', 'ACTIVO')
            ],
            'enrollment_status' => ['sometimes', ValidationConstants::ENROLLMENT_STATUSES_RULE],
            'allergies' => ['sometimes', 'nullable', 'string', 'max:500'],
            'medical_conditions' => ['sometimes', 'nullable', 'string', 'max:500'],
            'address' => ['sometimes', 'nullable', 'string', 'max:255'],
            'emergency_contact_name' => ['sometimes', 'nullable', 'string', 'max:150'],
            'emergency_contact_phone' => ['sometimes', 'nullable', 'string', 'max:15'],
            'parents' => ['sometimes', 'array', 'max:4'],
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
            'enrollment_status.in' => 'El estado de matrícula no es válido.',
        ];
    }
}
