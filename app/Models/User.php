<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name', 'nombres', 'apellidos', 'numero_matricula',
        'email', 'password', 'role',
        'cedula', 'sexo', 'grado_academico', 'direccion', 'celular',
        'telefono', 'foto', 'estado', 'last_login_at', 'last_login_ip',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'last_login_at'     => 'datetime',
        ];
    }

    // Nombre completo desde nombres + apellidos
    public function getNombreCompletoAttribute(): string
    {
        if ($this->nombres && $this->apellidos) {
            return trim("{$this->nombres} {$this->apellidos}");
        }
        return $this->name ?? '';
    }

    // Accessor para la URL de la foto
    public function getFotoUrlAttribute(): string
    {
        return $this->foto
            ? asset('storage/' . $this->foto)
            : 'https://ui-avatars.com/api/?name=' . urlencode($this->nombre_completo ?: $this->name) . '&background=4A1B8C&color=ffffff&size=128';
    }

    // Verifica si el usuario está activo
    public function estaActivo(): bool
    {
        return $this->estado === 'activo';
    }

    // Relación: docente pertenece a muchos cursos
    public function cursosDocente()
    {
        return $this->belongsToMany(Curso::class, 'docente_curso', 'docente_id', 'curso_id')
                    ->withTimestamps();
    }

    // Relación: estudiante → cursos (sin datos de pivot, retrocompatible)
    public function cursosEstudiante()
    {
        return $this->belongsToMany(Curso::class, 'estudiante_curso', 'estudiante_id', 'curso_id')
                    ->withTimestamps();
    }

    // Relación: estudiante → cursos con datos completos de matrícula
    public function cursos()
    {
        return $this->belongsToMany(Curso::class, 'estudiante_curso', 'estudiante_id', 'curso_id')
                    ->withPivot('periodo_lectivo_id', 'docente_id', 'fecha_matricula', 'estado')
                    ->withTimestamps();
    }

    // Relación: estudiante tiene muchas asistencias
    public function asistencias()
    {
        return $this->hasMany(Asistencia::class, 'estudiante_id');
    }

    // Relación: docente/admin → asistencias que registró
    public function asistenciasRegistradas()
    {
        return $this->hasMany(Asistencia::class, 'registrado_por');
    }

    // Relación: estudiante tiene muchas bitácoras
    public function bitacoras()
    {
        return $this->hasMany(Bitacora::class, 'estudiante_id');
    }
}
