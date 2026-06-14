<?php

namespace App\Http\Controllers\Estudiante;

use App\Http\Controllers\Controller;
use App\Models\Asistencia;
use App\Models\Bitacora;
use App\Models\BitacoraConfig;
use App\Models\Calificacion;
use App\Models\Curso;
use App\Models\PeriodoLectivo;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $estudiante    = Auth::user();
        $periodoActivo = PeriodoLectivo::where('activo', true)->first()
            ?? PeriodoLectivo::orderByDesc('fecha_inicio')->first();

        $periodoId = $periodoActivo?->id ?? 0;

        $matricula = DB::table('estudiante_curso')
            ->join('cursos', 'cursos.id', '=', 'estudiante_curso.curso_id')
            ->where('estudiante_id', $estudiante->id)
            ->where('estudiante_curso.periodo_lectivo_id', $periodoId)
            ->select('estudiante_curso.*', 'cursos.nombre as curso_nombre')
            ->first();

        if (!$matricula) {
            return Inertia::render('Estudiante/Dashboard', [
                'sinMatricula'  => true,
                'periodoActivo' => $periodoActivo,
            ]);
        }

        // ── Próximas bitácoras a entregar (sin entrega, plazo vigente) ────────
        $proximasBitacoras = BitacoraConfig::with(['actividad', 'fase'])
            ->whereHas('fase', fn ($q) =>
                $q->where('curso_id', $matricula->curso_id)
                  ->where('periodo_lectivo_id', $periodoId))
            ->whereDoesntHave('entregas', fn ($q) =>
                $q->where('estudiante_id', $estudiante->id))
            ->whereHas('actividad', fn ($q) =>
                $q->where('fecha_finalizacion', '>=', today())
                  ->where('estado', 'activa'))
            ->get()
            ->sortBy(fn ($c) => optional($c->actividad?->fecha_entrega)->timestamp ?? PHP_INT_MAX)
            ->take(3)
            ->values()
            ->map(fn ($config) => [
                'numero_global'  => $config->numero_global,
                'nombre'         => $config->nombre,
                'actividad'      => $config->actividad?->titulo,
                'fecha_entrega'  => optional($config->actividad?->fecha_entrega)->toDateString(),
                'dias_restantes' => $config->actividad?->fecha_entrega
                    ? today()->diffInDays($config->actividad->fecha_entrega, false)
                    : null,
                'tipo_entrega'   => $config->actividad?->tipo_entrega,
            ]);

        // ── Últimas notas ─────────────────────────────────────────────────────
        $ultimasNotas = Calificacion::with(['bitacora.config:id,numero_global,nombre'])
            ->whereHas('bitacora', fn ($q) =>
                $q->where('estudiante_id', $estudiante->id)
                  ->where('periodo_lectivo_id', $periodoId))
            ->orderByDesc('fecha_calificacion')
            ->take(5)
            ->get()
            ->map(fn ($c) => [
                'nota'            => $c->nota,
                'numero_global'   => $c->bitacora?->config?->numero_global,
                'nombre_bitacora' => $c->bitacora?->config?->nombre,
                'fecha'           => optional($c->fecha_calificacion)->toDateString(),
            ]);

        // ── Asistencia del mes actual ─────────────────────────────────────────
        $asistenciaMes = Asistencia::where('estudiante_id', $estudiante->id)
            ->where('periodo_lectivo_id', $periodoId)
            ->whereMonth('fecha', now()->month)
            ->whereYear('fecha', now()->year)
            ->get();

        $totalMes    = $asistenciaMes->count();
        $presenteMes = $asistenciaMes->where('estado', 'presente')->count();

        // ── Stats generales ───────────────────────────────────────────────────
        $todasNotas = Calificacion::whereHas('bitacora',
            fn ($q) => $q->where('estudiante_id', $estudiante->id)
                         ->where('periodo_lectivo_id', $periodoId)
        )->pluck('nota');

        $totalBitacoras = BitacoraConfig::whereHas('fase',
            fn ($q) => $q->where('curso_id', $matricula->curso_id)
                         ->where('periodo_lectivo_id', $periodoId)
        )->count();

        $entregadas = Bitacora::where('estudiante_id', $estudiante->id)
            ->where('periodo_lectivo_id', $periodoId)
            ->count();

        return Inertia::render('Estudiante/Dashboard', [
            'proximasBitacoras' => $proximasBitacoras,
            'ultimasNotas'      => $ultimasNotas,
            'periodoActivo'     => $periodoActivo,
            'sinMatricula'      => false,
            'curso'             => ['nombre' => $matricula->curso_nombre],
            'asistencia'        => [
                'porcentaje_mes' => $totalMes > 0 ? round($presenteMes / $totalMes * 100) : 0,
                'presente'       => $presenteMes,
                'ausente'        => $asistenciaMes->where('estado', 'ausente')->count(),
                'tardanza'       => $asistenciaMes->where('estado', 'tardanza')->count(),
                'total_mes'      => $totalMes,
            ],
            'stats' => [
                'promedio_notas'        => $todasNotas->count() > 0 ? round($todasNotas->avg(), 2) : null,
                'bitacoras_entregadas'  => $entregadas,
                'total_bitacoras'       => $totalBitacoras,
                'porcentaje_entrega'    => $totalBitacoras > 0
                    ? round($entregadas / $totalBitacoras * 100) : 0,
            ],
        ]);
    }
}
