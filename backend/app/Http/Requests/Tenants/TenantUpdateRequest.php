<?php

namespace App\Http\Requests\Tenants;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TenantUpdateRequest extends FormRequest
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
        $tenantId = $this->route('id');

        return [
            'code' => ['nullable', 'string', 'max:20', Rule::unique('tenants')->ignore($tenantId)],
            'modular_code' => ['nullable', 'string', 'max:20', Rule::unique('tenants')->ignore($tenantId)],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'ruc' => ['nullable', 'string', 'max:11'],
            'director_name' => ['nullable', 'string', 'max:255'],
            'founded_year' => ['nullable', 'integer', 'min:1900', 'max:2100'],
            'institution_type' => ['nullable', 'string', 'in:ESTATAL,PRIVADA,CONVENIO'],
            'level' => ['nullable', 'string', 'in:INICIAL,PRIMARIA,SECUNDARIA,MULTIPLE'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:255'],
            'department' => ['nullable', 'string', 'max:50'],
            'province' => ['nullable', 'string', 'max:50'],
            'district' => ['nullable', 'string', 'max:50'],
            'ugel' => ['nullable', 'string', 'max:10'],
            'ubigeo' => ['nullable', 'string', 'max:10'],
            'timezone' => ['nullable', 'string', 'max:50'],
            'primary_color' => ['nullable', 'string', 'max:10'],
            'is_active' => ['boolean'],
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
            'code.unique' => 'El código ya está registrado.',
            'code.max' => 'El código no puede tener más de 20 caracteres.',
            'modular_code.unique' => 'El código modular ya está registrado.',
            'modular_code.max' => 'El código modular no puede tener más de 20 caracteres.',
            'name.required' => 'El nombre de la institución es obligatorio.',
            'name.max' => 'El nombre no puede tener más de 255 caracteres.',
            'ruc.max' => 'El RUC no puede tener más de 11 caracteres.',
            'director_name.max' => 'El nombre del director no puede tener más de 255 caracteres.',
            'founded_year.integer' => 'El año de fundación debe ser un número.',
            'founded_year.min' => 'El año de fundación no puede ser menor a 1900.',
            'founded_year.max' => 'El año de fundación no puede ser mayor a 2100.',
            'institution_type.in' => 'El tipo de institución no es válido.',
            'level.in' => 'El nivel educativo no es válido.',
            'email.email' => 'El correo electrónico no es válido.',
            'email.max' => 'El correo electrónico no puede tener más de 255 caracteres.',
            'phone.max' => 'El teléfono no puede tener más de 20 caracteres.',
            'address.max' => 'La dirección no puede tener más de 255 caracteres.',
            'department.max' => 'El departamento no puede tener más de 50 caracteres.',
            'province.max' => 'La provincia no puede tener más de 50 caracteres.',
            'district.max' => 'El distrito no puede tener más de 50 caracteres.',
            'ugel.max' => 'La UGEL no puede tener más de 10 caracteres.',
            'ubigeo.max' => 'El ubigeo no puede tener más de 10 caracteres.',
            'timezone.max' => 'La zona horaria no puede tener más de 50 caracteres.',
            'primary_color.max' => 'El color primario no puede tener más de 10 caracteres.',
        ];
    }
}
