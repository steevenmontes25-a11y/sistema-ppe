<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActividadCronograma;
use App\Models\Asistencia;
use App\Models\Bitacora;
use App\Models\Curso;
use App\Models\PeriodoLectivo;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $periodoActivo = PeriodoLectivo::where('activo', true)->first();

        // ── Stats principales ─────────────────────────────────────────────────
        $stats = [
            'estudiantes'         => User::where('role', 'estudiante')->where('estado', 'activo')->count(),
            'docentes'            => User::where('role', 'docente')->where('estado', 'activo')->count(),
            'actividades'         => ActividadCronograma::whereHas('fasePpe',
                fn ($q) => $q->where('periodo_lectivo_id', $periodoActivo?->id))->count(),
            'bitacoras_pendientes' => Bitacora::where('periodo_lectivo_id', $periodoActivo?->id)
                ->doesntHave('calificacion')->count(),
        ];

        // ── Asistencia de hoy ─────────────────────────────────────────────────
        $asistenciaHoy = Asistencia::where('fecha', today())
            ->where('periodo_lectivo_id', $periodoActivo?->id)
            ->get();

        $resumenAsistenciaHoy = [
            'total'    => $asistenciaHoy->count(),
            'presente' => $asistenciaHoy->where('estado', 'presente')->count(),
            'ausente'  => $asistenciaHoy->where('estado', 'ausente')->count(),
            'tardanza' => $asistenciaHoy->where('estado', 'tardanza')->count(),
        ];

        // ── Actividades próximas a vencer (7 días) ────────────────────────────
        $actividadesProximas = ActividadCronograma::with('fasePpe.curso')
            ->where('estado', 'activa')
            ->whereBetween('fecha_entrega', [today(), today()->addDays(7)])
            ->orderBy('fecha_entrega')
            ->take(5)
            ->get()
            ->map(fn ($a) => [
                'id'             => $a->id,
                'titulo'         => $a->titulo,
                'curso'          => $a->fasePpe?->curso?->nombre ?? '—',
                'fecha_entrega'  => optional($a->fecha_entrega)->toDateString(),
                'dias_restantes' => $a->fecha_entrega ? today()->diffInDays($a->fecha_entrega, false) : null,
            ]);

        // ── Bitácoras entregadas últimas 24 h ─────────────────────────────────
        $bitacorasRecientes = Bitacora::with([
            'estudiante:id,nombres,apellidos',
            'config:id,numero_global,nombre',
            'curso:id,nombre',
        ])
        ->where('periodo_lectivo_id', $periodoActivo?->id)
        ->where('created_at', '>=', now()->subHours(24))
        ->orderByDesc('created_at')
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

        // ── Entregas por curso ────────────────────────────────────────────────
        $entregasPorCurso = Curso::where('periodo_lectivo_id', $periodoActivo?->id)
            ->withCount([
                'bitacoras as total_entregas' => fn ($q) =>
                    $q->where('periodo_lectivo_id', $periodoActivo?->id),
                'bitacoras as calificadas' => fn ($q) =>
                    $q->where('periodo_lectivo_id', $periodoActivo?->id)
                      ->whereHas('calificacion'),
            ])
            ->get(['id', 'nombre']);

        // ── Estudiantes por curso ─────────────────────────────────────────────
        $estudiantesPorCurso = Curso::where('periodo_lectivo_id', $periodoActivo?->id)
            ->withCount([
                'estudiantes as total' => fn ($q) =>
                    $q->where('estudiante_curso.periodo_lectivo_id', $periodoActivo?->id),
            ])
            ->get(['id', 'nombre']);

        return Inertia::render('Admin/Dashboard', [
            'stats'                 => $stats,
            'resumenAsistenciaHoy'  => $resumenAsistenciaHoy,
            'actividadesProximas'   => $actividadesProximas,
            'bitacorasRecientes'    => $bitacorasRecientes,
            'entregasPorCurso'      => $entregasPorCurso,
            'estudiantesPorCurso'   => $estudiantesPorCurso,
            'periodoActivo'         => $periodoActivo,
        ]);
    }
}
