<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BitacoraConfig extends Model
{
    use HasFactory;

    protected $table = 'bitacoras_config';

    protected $fillable = [
        'fase_ppe_id', 'numero_en_fase', 'numero_global', 'nombre',
        'actividad_id', 'estado', 'descripcion',
    ];

    protected $appends = ['entregas_count'];

    public function fase()
    {
        return $this->belongsTo(FasePpe::class, 'fase_ppe_id');
    }

    public function actividad()
    {
        return $this->belongsTo(ActividadCronograma::class, 'actividad_id');
    }

    public function bitacoras()
    {
        return $this->hasMany(Bitacora::class, 'bitacora_config_id');
    }

    // Alias semántico usado en carga eager con constraints de estudiante
    public function entregas()
    {
        return $this->hasMany(Bitacora::class, 'bitacora_config_id');
    }

    public function getEntregasCountAttribute(): int
    {
        return Bitacora::where('bitacora_config_id', $this->id)->count();
    }
}
