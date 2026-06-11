<?php

namespace App\Http\Controllers\Estudiante;

use App\Http\Controllers\Controller;
use App\Models\Asistencia;
use App\Models\Curso;
use App\Models\PeriodoLectivo;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MiAsistenciaController extends Controller
{
    public function index(Request $request)
    {
        $estudiante    = auth()->user();
        $periodoActivo = PeriodoLectivo::where('activo', true)->first();
        $mesFiltro     = (int) $request->get('mes',  now()->month);
        $anioFiltro    = (int) $request->get('anio', now()->year);

        $matricula = DB::table('estudiante_curso')
            ->where('estudiante_id', $estudiante->id)
            ->where('periodo_lectivo_id', $periodoActivo?->id)
            ->first();

        if (!$matricula) {
            return Inertia::render('Estudiante/MiAsistencia/Index', [
                'asistenciasMes'   => [],
                'porMes'           => [],
                'stats'            => null,
                'sinMatricula'     => true,
                'mesesDisponibles' => [],
            ]);
        }

        $todasAsistencias = Asistencia::where('estudiante_id', $estudiante->id)
            ->where('periodo_lectivo_id', $periodoActivo->id)
            ->with('registradoPor:id,nombres,apellidos')
            ->orderBy('fecha', 'desc')
            ->get();

        $asistenciasMes = $todasAsistencias->filter(
            fn ($a) => $a->fecha->month === $mesFiltro && $a->fecha->year === $anioFiltro
        );

        // ── Stats período completo ────────────────────────────────────────────
        $total    = $todasAsistencias->count();
        $presente = $todasAsistencias->where('estado', 'presente')->count();
        $ausente  = $todasAsistencias->where('estado', 'ausente')->count();
        $tardanza = $todasAsistencias->where('estado', 'tardanza')->count();
        $justif   = $todasAsistencias->where('estado', 'justificado')->count();

        $stats = [
            'total'          => $total,
            'presente'       => $presente,
            'ausente'        => $ausente,
            'tardanza'       => $tardanza,
            'justificado'    => $justif,
            'porcentaje'     => $total > 0 ? round($presente / $total * 100) : 0,
            'porcentaje_mes' => $asistenciasMes->count() > 0
                ? round($asistenciasMes->where('estado', 'presente')->count()
                    / $asistenciasMes->count() * 100)
                : 0,
        ];

        // ── Historial agrupado por mes ────────────────────────────────────────
        $porMes = $todasAsistencias
            ->groupBy(fn ($a) => $a->fecha->format('Y-m'))
            ->map(fn ($items, $key) => [
                'mes'         => $key,
                'mes_nombre'  => Carbon::parse($key . '-01')->locale('es')->isoFormat('MMMM YYYY'),
                'total'       => $items->count(),
                'presente'    => $items->where('estado', 'presente')->count(),
                'ausente'     => $items->where('estado', 'ausente')->count(),
                'tardanza'    => $items->where('estado', 'tardanza')->count(),
                'justificado' => $items->where('estado', 'justificado')->count(),
                'porcentaje'  => $items->count() > 0
                    ? round($items->where('estado', 'presente')->count()
                        / $items->count() * 100)
                    : 0,
            ])
            ->values()
            ->sortByDesc('mes')
            ->values();

        // ── Meses disponibles para el selector ────────────────────────────────
        $mesesDisponibles = $todasAsistencias
            ->groupBy(fn ($a) => $a->fecha->format('Y-m'))
            ->keys()
            ->map(fn ($m) => [
                'valor'  => $m,
                'nombre' => Carbon::parse($m . '-01')->locale('es')->isoFormat('MMMM YYYY'),
            ])
            ->sortDesc()
            ->values();

        // ── Asistencias del mes formateadas ───────────────────────────────────
        $asistenciasMesData = $asistenciasMes->values()->map(fn ($a) => [
            'id'             => $a->id,
            'fecha'          => $a->fecha->toDateString(),
            'estado'         => $a->estado,
            'observacion'    => $a->observacion,
            'registrado_por' => $a->registradoPor
                ? trim($a->registradoPor->nombres . ' ' . $a->registradoPor->apellidos)
                : null,
        ]);

        return Inertia::render('Estudiante/MiAsistencia/Index', [
            'asistenciasMes'   => $asistenciasMesData,
            'porMes'           => $porMes,
            'stats'            => $stats,
            'periodoActivo'    => $periodoActivo,
            'sinMatricula'     => false,
            'curso'            => Curso::find($matricula->curso_id, ['id', 'nombre']),
            'mesFiltro'        => $mesFiltro,
            'anioFiltro'       => $anioFiltro,
            'mesesDisponibles' => $mesesDisponibles,
        ]);
    }
}
