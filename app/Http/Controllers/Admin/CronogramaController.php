<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ActividadCronogramaRequest;
use App\Models\ActividadCronograma;
use App\Models\BitacoraConfig;
use App\Models\Curso;
use App\Models\FasePpe;
use App\Models\PeriodoLectivo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CronogramaController extends Controller
{
    public function index(Request $request): Response
    {
        $periodoId = $request->get('periodo_id');

        $periodoActivo = $periodoId
            ? PeriodoLectivo::find($periodoId)
            : PeriodoLectivo::where('activo', true)->first();

        // Fallback al período más reciente si no hay ninguno activo
        $periodoActivo = $periodoActivo ?? PeriodoLectivo::orderByDesc('fecha_inicio')->first();

        $cursos = $periodoActivo
            ? Curso::where('periodo_lectivo_id', $periodoActivo->id)->orderBy('id')->get()
            : collect();

        $cursoId = (int) $request->get('curso', $cursos->first()?->id ?? 0);
        $curso   = $cursos->firstWhere('id', $cursoId);

        // Fases con actividades y bitácoras config (auto-creadas si no existen)
        $fases = $curso
            ? FasePpe::where('curso_id', $curso->id)
                ->with(['actividades' => fn ($q) => $q->withCount('bitacoras')->orderBy('fecha_inicio')])
                ->orderBy('orden')
                ->get()
                ->map(function ($fase) {
                    $numeroInicio = ($fase->orden - 1) * 5 + 1;

                    for ($i = 1; $i <= 5; $i++) {
                        $numeroGlobal = $numeroInicio + ($i - 1);
                        BitacoraConfig::firstOrCreate(
                            ['fase_ppe_id' => $fase->id, 'numero_en_fase' => $i],
                            [
                                'numero_global' => $numeroGlobal,
                                'nombre'        => "Bitácora {$numeroGlobal}",
                                'estado'        => 'pendiente',
                            ]
                        );
                    }
                    $fase->load('bitacorasConfig.actividad');
                    return $fase;
                })
            : collect();

        $totalEstudiantes = $curso ? $curso->estudiantes()->count() : 0;

        // Todas las fases del período para el modal de creación/edición
        $todasFases = $periodoActivo
            ? FasePpe::where('periodo_lectivo_id', $periodoActivo->id)
                ->with(['curso', 'periodo'])
                ->orderBy('orden')
                ->get()
            : collect();

        $periodos = PeriodoLectivo::orderByDesc('fecha_inicio')->get();

        return Inertia::render('Admin/Cronograma/Index', [
            'fases'            => $fases,
            'cursos'           => $cursos,
            'todasFases'       => $todasFases,
            'periodos'         => $periodos,
            'periodoActivo'    => $periodoActivo,
            'cursoActual'      => $cursoId,
            'totalEstudiantes' => $totalEstudiantes,
        ]);
    }

    public function store(ActividadCronogramaRequest $request): RedirectResponse
    {
        $fase = FasePpe::findOrFail($request->fase_ppe_id);

        ActividadCronograma::create([
            ...$request->validated(),
            'curso_id' => $fase->curso_id,
        ]);

        return redirect()->back()->with('success', 'Actividad creada correctamente.');
    }

    public function update(ActividadCronogramaRequest $request, ActividadCronograma $actividad): RedirectResponse
    {
        $fase = FasePpe::findOrFail($request->fase_ppe_id);

        $actividad->update([
            ...$request->validated(),
            'curso_id' => $fase->curso_id,
        ]);

        return redirect()->back()->with('success', 'Actividad actualizada correctamente.');
    }

    public function destroy(ActividadCronograma $actividad): RedirectResponse
    {
        if ($actividad->bitacoras()->exists()) {
            return redirect()->back()->with('error', 'No se puede eliminar una actividad que ya tiene entregas registradas.');
        }

        $actividad->delete();

        return redirect()->back()->with('success', 'Actividad eliminada correctamente.');
    }

    public function updateBitacoraConfig(Request $request, BitacoraConfig $bitacoraConfig): RedirectResponse
    {
        $request->validate([
            'nombre'       => ['required', 'string', 'max:100'],
            'actividad_id' => ['nullable', 'exists:actividades_cronograma,id'],
            'estado'       => ['required', 'in:pendiente,activa,cerrada'],
            'descripcion'  => ['nullable', 'string'],
        ]);

        $bitacoraConfig->update($request->only(['nombre', 'actividad_id', 'estado', 'descripcion']));

        return redirect()->back()->with('success', 'Bitácora actualizada correctamente.');
    }
}
