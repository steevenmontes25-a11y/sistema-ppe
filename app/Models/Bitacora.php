<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Bitacora extends Model
{
    use HasFactory;

    protected $table = 'bitacoras';

    protected $fillable = [
        'estudiante_id', 'bitacora_config_id', 'curso_id',
        'periodo_lectivo_id', 'archivo_path', 'archivo_nombre',
        'archivo_tipo', 'archivo_tamanio', 'descripcion',
        'estado', 'fecha_entrega',
    ];

    protected $casts = [
        'fecha_entrega'   => 'datetime',
        'archivo_tamanio' => 'integer',
    ];

    public function estudiante()
    {
        return $this->belongsTo(User::class, 'estudiante_id');
    }

    public function config()
    {
        return $this->belongsTo(BitacoraConfig::class, 'bitacora_config_id');
    }

    public function curso()
    {
        return $this->belongsTo(Curso::class);
    }

    public function calificacion()
    {
        return $this->hasOne(Calificacion::class);
    }

    public function getCalificadaAttribute(): bool
    {
        return $this->calificacion !== null;
    }

    public function getArchivoUrlAttribute(): ?string
    {
        return $this->archivo_path ? Storage::url($this->archivo_path) : null;
    }
}
