<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Calificacion extends Model
{
    use HasFactory;

    protected $table = 'calificaciones';

    protected $fillable = [
        'bitacora_id', 'docente_id', 'nota', 'justificacion', 'fecha_calificacion',
    ];

    protected $casts = [
        'nota'               => 'decimal:2',
        'fecha_calificacion' => 'datetime',
    ];

    public function bitacora()
    {
        return $this->belongsTo(Bitacora::class);
    }

    public function docente()
    {
        return $this->belongsTo(User::class, 'docente_id');
    }

    public function getColorNotaAttribute(): string
    {
        $nota = (float) $this->nota;
        if ($nota >= 9) return 'green';
        if ($nota >= 7) return 'blue';
        if ($nota >= 5) return 'yellow';
        return 'red';
    }
}
