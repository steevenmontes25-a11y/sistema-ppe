<?php

namespace App\Http\Controllers\Docente;

use App\Http\Controllers\Controller;
use App\Models\ActividadCronograma;
use App\Models\Asistencia;
use App\Models\Bitacora;
use App\Models\Calificacion;
use App\Models\PeriodoLectivo;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $docente       = Auth::user();
        $periodoActivo = PeriodoLectivo::where('activo', true)->first();

        // ── Cursos asignados al docente en el período ─────────────────────────
        $cursosAsignados = $docente->cursosDocente()
            ->where('periodo_lectivo_id', $periodoActivo?->id)
            ->withCount([
                'estudiantes as total_estudiantes' => fn ($q) =>
                    $q->where('estudiante_curso.periodo_lectivo_id', $periodoActivo?->id),
            ])
            ->get(['cursos.id', 'cursos.nombre']);

        $cursoIds = $cursosAsignados->pluck('id');

        // ── Bitácoras pendientes de calificar ─────────────────────────────────
        $bitacorasPendientes = Bitacora::with([
            'estudiante:id,nombres,apellidos',
            'config:id,numero_global,nombre',
            'curso:id,nombre',
        ])
        ->whereIn('curso_id', $cursoIds)
        ->where('periodo_lectivo_id', $periodoActivo?->id)
        ->doesntHave('calificacion')
        ->orderBy('created_at', 'asc')
        ->take(8)
        ->get()
        ->map(fn ($b) => [
            'id'              => $b->id,
            'estudiante'      => trim(($b->estudiante?->nombres ?? '') . ' ' . ($b->estudiante?->apellidos ?? '')),
            'numero_global'   => $b->config?->numero_global,
            'nombre_bitacora' => $b->config?->nombre,
            'curso'           => $b->curso?->nombre,
            'hace'            => $b->created_at->diffForHumans(),
        ]);

        // ── Asistencia registrada hoy por este docente ────────────────────────
        $asistenciaHoy = Asistencia::where('registrado_por', $docente->id)
            ->where('fecha', today())
            ->get();

        $resumenAsistenciaHoy = [
            'total'        => $asistenciaHoy->count(),
            'presente'     => $asistenciaHoy->where('estado', 'presente')->count(),
            'ausente'      => $asistenciaHoy->where('estado', 'ausente')->count(),
            'tardanza'     => $asistenciaHoy->where('estado', 'tardanza')->count(),
            'justificado'  => $asistenciaHoy->where('estado', 'justificado')->count(),
            'registrado'   => $asistenciaHoy->count() > 0,
        ];

        // ── Próximas actividades ──────────────────────────────────────────────
        $actividadesProximas = ActividadCronograma::with('fasePpe.curso')
            ->whereIn('curso_id', $cursoIds)
            ->where('estado', 'activa')
            ->where('fecha_entrega', '>=', today())
            ->orderBy('fecha_entrega')
            ->take(5)
            ->get()
            ->map(fn ($a) => [
                'titulo'         => $a->titulo,
                'curso'          => $a->fasePpe?->curso?->nombre ?? $a->curso?->nombre ?? '—',
                'fecha_entrega'  => optional($a->fecha_entrega)->toDateString(),
                'dias_restantes' => $a->fecha_entrega ? today()->diffInDays($a->fecha_entrega, false) : null,
                'tipo_entrega'   => $a->tipo_entrega,
            ]);

        // ── Stats ─────────────────────────────────────────────────────────────
        $totalCalificadas = Calificacion::where('docente_id', $docente->id)->count();
        $promedioGeneral  = Calificacion::where('docente_id', $docente->id)->avg('nota');

        return Inertia::render('Docente/Dashboard', [
            'cursosAsignados'     => $cursosAsignados,
            'bitacorasPendientes' => $bitacorasPendientes,
            'actividadesProximas' => $actividadesProximas,
            'asistenciaHoy'       => $resumenAsistenciaHoy,
            'periodoActivo'       => $periodoActivo,
            'stats' => [
                'total_estudiantes'    => $cursosAsignados->sum('total_estudiantes'),
                'bitacoras_pendientes' => $bitacorasPendientes->count(),
                'calificaciones_dadas' => $totalCalificadas,
                'promedio_general'     => $promedioGeneral ? round($promedioGeneral, 2) : null,
            ],
        ]);
    }
}
