<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class PeriodoLectivoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $periodoId = $this->route('periodo')?->id ?? 'NULL';

        return [
            'nombre'       => "required|string|max:50|unique:periodos_lectivos,nombre,{$periodoId}",
            'fecha_inicio' => 'required|date',
            'fecha_fin'    => 'required|date|after:fecha_inicio',
            'estado'       => 'required|in:planificacion,en_curso,finalizado,archivado',
            'descripcion'  => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required'       => 'El nombre del período es obligatorio.',
            'nombre.unique'         => 'Ya existe un período con ese nombre.',
            'nombre.max'            => 'El nombre no puede superar 50 caracteres.',
            'fecha_inicio.required' => 'La fecha de inicio es obligatoria.',
            'fecha_fin.required'    => 'La fecha de fin es obligatoria.',
            'fecha_fin.after'       => 'La fecha de fin debe ser posterior al inicio.',
            'estado.required'       => 'El estado es obligatorio.',
            'estado.in'             => 'Estado no válido.',
            'descripcion.max'       => 'La descripción no puede superar 500 caracteres.',
        ];
    }
}
