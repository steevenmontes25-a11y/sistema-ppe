<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Asistencia extends Model
{
    use HasFactory;

    protected $table = 'asistencias';

    protected $fillable = [
        'estudiante_id', 'curso_id', 'periodo_lectivo_id',
        'registrado_por', 'corregido_por',
        'fecha', 'estado', 'observacion', 'corregido_at',
    ];

    protected $casts = [
        'fecha'        => 'date',
        'corregido_at' => 'datetime',
    ];

    public function estudiante()
    {
        return $this->belongsTo(User::class, 'estudiante_id');
    }

    public function curso()
    {
        return $this->belongsTo(Curso::class);
    }

    public function registradoPor()
    {
        return $this->belongsTo(User::class, 'registrado_por');
    }

    public function corregidoPor()
    {
        return $this->belongsTo(User::class, 'corregido_por');
    }

    public function scopePeriodoActivo($query)
    {
        $periodo = \App\Models\PeriodoLectivo::where('activo', true)->first();
        return $query->where('periodo_lectivo_id', $periodo?->id);
    }

    public function getColorEstadoAttribute(): string
    {
        return match ($this->estado) {
            'presente'    => 'green',
            'ausente'     => 'red',
            'tardanza'    => 'yellow',
            'justificado' => 'blue',
            default       => 'gray',
        };
    }
}
