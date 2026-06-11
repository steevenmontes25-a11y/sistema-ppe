<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActividadCronograma extends Model
{
    use HasFactory;

    protected $table = 'actividades_cronograma';

    protected $fillable = [
        'titulo', 'descripcion',
        'fase_ppe_id', 'curso_id',
        'fecha_inicio', 'fecha_entrega', 'fecha_finalizacion',
        'tipo_entrega', 'puntaje_maximo', 'estado',
    ];

    protected $casts = [
        'fecha_inicio'       => 'date',
        'fecha_entrega'      => 'date',
        'fecha_finalizacion' => 'date',
        'puntaje_maximo'     => 'decimal:2',
    ];

    public function fasePpe()
    {
        return $this->belongsTo(FasePpe::class, 'fase_ppe_id');
    }

    public function curso()
    {
        return $this->belongsTo(Curso::class);
    }

    public function bitacorasConfig()
    {
        return $this->hasMany(BitacoraConfig::class, 'actividad_id');
    }

    // Bitácoras entregadas: actividad → BitacoraConfig → Bitacora
    public function bitacoras()
    {
        return $this->hasManyThrough(
            Bitacora::class,
            BitacoraConfig::class,
            'actividad_id',       // FK en bitacoras_config → actividades_cronograma
            'bitacora_config_id', // FK en bitacoras → bitacoras_config
            'id',
            'id'
        );
    }

    /** Actividades con estado 'activa' */
    public function scopeActivo(Builder $query): Builder
    {
        return $query->where('estado', 'activa');
    }

    /** Filtrar por curso */
    public function scopePorCurso(Builder $query, int $cursoId): Builder
    {
        return $query->where('curso_id', $cursoId);
    }

    public function getEntregasCountAttribute(): int
    {
        return $this->bitacoras()->count();
    }

    public function getDiasRestantesAttribute(): int
    {
        $fecha = $this->fecha_entrega instanceof \Carbon\Carbon
            ? $this->fecha_entrega
            : \Carbon\Carbon::parse($this->fecha_entrega);
        return max(0, (int) now()->startOfDay()->diffInDays($fecha->startOfDay(), false));
    }
}
