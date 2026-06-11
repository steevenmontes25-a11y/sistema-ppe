<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class MatriculaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('estudiante')?->id;

        return [
            'nombres'           => ['required', 'string', 'max:100'],
            'apellidos'         => ['required', 'string', 'max:100'],
            'cedula'            => ['required', 'string', 'size:10', 'regex:/^\d{10}$/', "unique:users,cedula,{$id}"],
            'numero_matricula'  => ['required', 'string', 'max:20', "unique:users,numero_matricula,{$id}"],
            'sexo'              => ['required', 'in:masculino,femenino,otro'],
            'direccion'         => ['nullable', 'string', 'max:255'],
            'email'             => ['required', 'email', "unique:users,email,{$id}"],
            'celular'           => ['nullable', 'string', 'max:15'],
            'curso_id'          => ['required', 'exists:cursos,id'],
            'docente_id'        => ['required', 'exists:users,id'],
            'periodo_lectivo_id'=> ['required', 'exists:periodos_lectivos,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombres.required'          => 'Los nombres son obligatorios.',
            'apellidos.required'        => 'Los apellidos son obligatorios.',
            'cedula.required'           => 'La cédula es obligatoria.',
            'cedula.size'               => 'La cédula debe tener exactamente 10 dígitos.',
            'cedula.regex'              => 'La cédula debe contener solo números.',
            'cedula.unique'             => 'Esta cédula ya está registrada.',
            'numero_matricula.required' => 'El número de matrícula es obligatorio.',
            'numero_matricula.unique'   => 'Este número de matrícula ya existe.',
            'sexo.required'             => 'El sexo es obligatorio.',
            'email.required'            => 'El correo electrónico es obligatorio.',
            'email.email'               => 'El correo electrónico no tiene un formato válido.',
            'email.unique'              => 'Este correo ya está registrado.',
            'curso_id.required'         => 'Debe seleccionar un curso.',
            'docente_id.required'       => 'Debe asignar un docente.',
            'periodo_lectivo_id.required' => 'El período lectivo es obligatorio.',
        ];
    }
}
