<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class PeriodoLectivo extends Model
{
    use HasFactory;

    protected $table = 'periodos_lectivos';

    protected $fillable = [
        'nombre', 'fecha_inicio', 'fecha_fin',
        'activo', 'estado', 'descripcion',
    ];

    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin'    => 'date',
        'activo'       => 'boolean',
    ];

    // ── Relaciones ────────────────────────────────────────────────────────────

    public function fases()
    {
        return $this->hasMany(FasePpe::class);
    }

    public function fasesPpe()
    {
        return $this->hasMany(FasePpe::class)->orderBy('orden');
    }

    public function cursos()
    {
        return $this->hasMany(Curso::class);
    }

    // ── Accessors ─────────────────────────────────────────────────────────────

    public function getStatsAttribute(): array
    {
        return [
            'estudiantes' => DB::table('estudiante_curso')
                ->where('periodo_lectivo_id', $this->id)
                ->where('estado', 'activo')
                ->count(),
            'docentes' => DB::table('estudiante_curso')
                ->where('periodo_lectivo_id', $this->id)
                ->distinct()
                ->count('docente_id'),
            'actividades' => ActividadCronograma::whereHas('fasePpe',
                fn($q) => $q->where('periodo_lectivo_id', $this->id)
            )->count(),
            'bitacoras' => Bitacora::where('periodo_lectivo_id', $this->id)->count(),
            'fases'     => $this->fases()->count(),
        ];
    }

    public function getDuracionDiasAttribute(): int
    {
        return $this->fecha_inicio->diffInDays($this->fecha_fin);
    }

    public function getProgresoAttribute(): int
    {
        $hoy = now();
        if ($hoy->lt($this->fecha_inicio)) return 0;
        if ($hoy->gt($this->fecha_fin))    return 100;
        $total       = $this->fecha_inicio->diffInDays($this->fecha_fin);
        $transcurrido = $this->fecha_inicio->diffInDays($hoy);
        return $total > 0 ? (int) round($transcurrido / $total * 100) : 0;
    }
}
