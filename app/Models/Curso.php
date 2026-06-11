<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Curso extends Model
{
    use HasFactory;

    protected $fillable = ['nombre', 'paralelo', 'periodo_lectivo_id'];

    public function periodoLectivo()
    {
        return $this->belongsTo(PeriodoLectivo::class);
    }

    public function docentes()
    {
        return $this->belongsToMany(User::class, 'docente_curso', 'curso_id', 'docente_id')->withTimestamps();
    }

    public function estudiantes()
    {
        return $this->belongsToMany(User::class, 'estudiante_curso', 'curso_id', 'estudiante_id')->withTimestamps();
    }

    public function actividades()
    {
        return $this->hasMany(ActividadCronograma::class);
    }

    public function asistencias()
    {
        return $this->hasMany(Asistencia::class);
    }

    public function bitacoras()
    {
        return $this->hasMany(Bitacora::class);
    }

    // Nombre completo del curso con paralelo
    public function getNombreCompletoAttribute(): string
    {
        return $this->nombre . ' — Paralelo ' . $this->paralelo;
    }
}
