<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ActividadCronogramaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titulo'            => ['required', 'string', 'max:255'],
            'descripcion'       => ['nullable', 'string'],
            'fase_ppe_id'       => ['required', 'exists:fases_ppe,id'],
            'fecha_inicio'      => ['required', 'date'],
            'fecha_entrega'     => ['required', 'date', 'after_or_equal:fecha_inicio'],
            'fecha_finalizacion'=> ['required', 'date', 'after_or_equal:fecha_entrega'],
            'tipo_entrega'      => ['required', 'in:pdf,foto,texto,mixto'],
            'puntaje_maximo'    => ['required', 'numeric', 'min:1', 'max:10'],
            'estado'            => ['required', 'in:borrador,activa,cerrada'],
        ];
    }

    public function messages(): array
    {
        return [
            'titulo.required'            => 'El título de la actividad es obligatorio.',
            'titulo.max'                 => 'El título no puede superar los 255 caracteres.',
            'fase_ppe_id.required'       => 'Debe seleccionar una fase PPE.',
            'fase_ppe_id.exists'         => 'La fase PPE seleccionada no existe.',
            'fecha_inicio.required'      => 'La fecha de inicio es obligatoria.',
            'fecha_inicio.date'          => 'La fecha de inicio no tiene un formato válido.',
            'fecha_entrega.required'     => 'La fecha de entrega es obligatoria.',
            'fecha_entrega.date'         => 'La fecha de entrega no tiene un formato válido.',
            'fecha_entrega.after_or_equal' => 'La fecha de entrega debe ser igual o posterior a la fecha de inicio.',
            'fecha_finalizacion.required'=> 'La fecha de finalización es obligatoria.',
            'fecha_finalizacion.date'    => 'La fecha de finalización no tiene un formato válido.',
            'fecha_finalizacion.after_or_equal' => 'La fecha de finalización debe ser igual o posterior a la fecha de entrega.',
            'tipo_entrega.required'      => 'Debe seleccionar el tipo de entrega.',
            'tipo_entrega.in'            => 'El tipo de entrega seleccionado no es válido.',
            'puntaje_maximo.required'    => 'El puntaje máximo es obligatorio.',
            'puntaje_maximo.numeric'     => 'El puntaje máximo debe ser un número.',
            'puntaje_maximo.min'         => 'El puntaje máximo debe ser al menos 1.',
            'puntaje_maximo.max'         => 'El puntaje máximo no puede superar 10.',
            'estado.required'            => 'El estado de la actividad es obligatorio.',
            'estado.in'                  => 'El estado seleccionado no es válido.',
        ];
    }
}
