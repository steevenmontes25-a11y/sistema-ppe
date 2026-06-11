<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class FasePpe extends Model
{
    use HasFactory;

    protected $table = 'fases_ppe';

    protected $fillable = [
        'periodo_lectivo_id', 'curso_id', 'nombre',
        'descripcion', 'orden', 'fecha_inicio', 'fecha_fin', 'estado',
    ];

    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin'    => 'date',
    ];

    public function periodo()
    {
        return $this->belongsTo(PeriodoLectivo::class, 'periodo_lectivo_id');
    }

    public function curso()
    {
        return $this->belongsTo(Curso::class);
    }

    public function actividades()
    {
        return $this->hasMany(ActividadCronograma::class, 'fase_ppe_id');
    }

    public function bitacorasConfig()
    {
        return $this->hasMany(BitacoraConfig::class, 'fase_ppe_id')->orderBy('numero_en_fase');
    }

    public function getRangoBitacorasAttribute(): string
    {
        $inicio = ($this->orden - 1) * 5 + 1;
        $fin    = $this->orden * 5;
        return "{$inicio}–{$fin}";
    }

    public function getStatsAttribute(): array
    {
        return [
            'actividades'         => $this->actividades()->count(),
            'bitacoras_config'    => $this->bitacorasConfig()->count(),
            'bitacoras_entregadas' => Bitacora::whereHas('config',
                fn($q) => $q->where('fase_ppe_id', $this->id))->count(),
        ];
    }

    public function getProgresoAttribute(): int
    {
        $hoy = now();
        if ($hoy < $this->fecha_inicio) return 0;
        if ($hoy > $this->fecha_fin)    return 100;
        $total = $this->fecha_inicio->diffInDays($this->fecha_fin);
        $trans = $this->fecha_inicio->diffInDays($hoy);
        return $total > 0 ? (int) round($trans / $total * 100) : 0;
    }
}
