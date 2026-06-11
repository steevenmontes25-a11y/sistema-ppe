<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PeriodoLectivoRequest;
use App\Models\PeriodoLectivo;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PeriodoLectivoController extends Controller
{
    public function index(): Response
    {
        $periodos = PeriodoLectivo::withCount('fases')
            ->orderBy('fecha_inicio', 'desc')
            ->get()
            ->map(fn($p) => array_merge($p->toArray(), [
                'stats'         => $p->stats,
                'progreso'      => $p->progreso,
                'duracion_dias' => $p->duracion_dias,
            ]));

        $periodoActivo = $periodos->firstWhere('activo', true);

        return Inertia::render('Admin/Periodos/Index', [
            'periodos'       => $periodos,
            'periodoActivo'  => $periodoActivo,
            'stats_globales' => [
                'total_periodos'    => $periodos->count(),
                'total_estudiantes' => User::role('estudiante')->count(),
                'total_docentes'    => User::role('docente')->count(),
            ],
        ]);
    }

    public function store(PeriodoLectivoRequest $request): RedirectResponse
    {
        PeriodoLectivo::create([
            'nombre'       => $request->nombre,
            'fecha_inicio' => $request->fecha_inicio,
            'fecha_fin'    => $request->fecha_fin,
            'estado'       => $request->estado,
            'descripcion'  => $request->descripcion,
            'activo'       => false,
        ]);

        return redirect()->back()->with('success', 'Período lectivo creado correctamente.');
    }

    public function update(PeriodoLectivoRequest $request, PeriodoLectivo $periodo): RedirectResponse
    {
        $periodo->update([
            'nombre'       => $request->nombre,
            'fecha_inicio' => $request->fecha_inicio,
            'fecha_fin'    => $request->fecha_fin,
            'estado'       => $request->estado,
            'descripcion'  => $request->descripcion,
        ]);

        return redirect()->back()->with('success', 'Período lectivo actualizado.');
    }

    public function activar(PeriodoLectivo $periodo): RedirectResponse
    {
        DB::transaction(function () use ($periodo) {
            PeriodoLectivo::where('id', '!=', $periodo->id)
                ->update(['activo' => false]);

            $periodo->update([
                'activo' => true,
                'estado' => 'en_curso',
            ]);
        });

        return redirect()->back()->with('success',
            "Período \"{$periodo->nombre}\" activado correctamente.");
    }

    public function desactivar(PeriodoLectivo $periodo): RedirectResponse
    {
        $periodo->update(['activo' => false, 'estado' => 'finalizado']);

        return redirect()->back()->with('success',
            "Período \"{$periodo->nombre}\" desactivado.");
    }

    public function destroy(PeriodoLectivo $periodo): RedirectResponse
    {
        $stats = $periodo->stats;

        if ($stats['estudiantes'] > 0 || $stats['actividades'] > 0 || $stats['bitacoras'] > 0) {
            return redirect()->back()->with('error',
                'No se puede eliminar: el período tiene datos asociados. Archívalo en su lugar.');
        }

        $nombre = $periodo->nombre;
        $periodo->delete();

        return redirect()->back()->with('success', "Período \"{$nombre}\" eliminado.");
    }
}
