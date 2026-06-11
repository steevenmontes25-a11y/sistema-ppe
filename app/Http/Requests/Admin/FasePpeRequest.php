<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class FasePpeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre'             => 'required|string|max:100',
            'descripcion'        => 'nullable|string|max:500',
            'periodo_lectivo_id' => 'required|exists:periodos_lectivos,id',
            'curso_id'           => 'required|exists:cursos,id',
            'fecha_inicio'       => 'required|date',
            'fecha_fin'          => 'required|date|after:fecha_inicio',
            'estado'             => 'required|in:planificada,activa,cerrada',
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required'             => 'El nombre de la fase es obligatorio',
            'periodo_lectivo_id.required' => 'Debe seleccionar un período lectivo',
            'curso_id.required'           => 'Debe seleccionar un curso',
            'fecha_fin.after'             => 'La fecha de fin debe ser posterior al inicio',
        ];
    }
}
