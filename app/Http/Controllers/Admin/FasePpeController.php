<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\FasePpeRequest;
use App\Models\BitacoraConfig;
use App\Models\Curso;
use App\Models\FasePpe;
use App\Models\PeriodoLectivo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class FasePpeController extends Controller
{
    public function index(Request $request)
    {
        $periodoFiltro = $request->get('periodo_id',
            PeriodoLectivo::where('activo', true)->value('id'));
        $cursoFiltro = $request->get('curso_id');

        $fases = FasePpe::with(['curso', 'periodo', 'bitacorasConfig'])
            ->where('periodo_lectivo_id', $periodoFiltro)
            ->when($cursoFiltro, fn($q) => $q->where('curso_id', $cursoFiltro))
            ->orderBy('curso_id')
            ->orderBy('orden')
            ->get()
            ->map(fn($f) => array_merge($f->toArray(), [
                'stats'           => $f->stats,
                'progreso'        => $f->progreso,
                'rango_bitacoras' => $f->rango_bitacoras,
            ]));

        $porCurso = $fases->groupBy('curso_id')->map(fn($items) => [
            'curso' => $items->first()['curso'],
            'fases' => $items->values(),
        ])->values();

        return Inertia::render('Admin/FasesPpe/Index', [
            'porCurso'           => $porCurso,
            'periodos'           => PeriodoLectivo::orderBy('fecha_inicio', 'desc')->get(),
            'cursos'             => Curso::orderBy('nombre')->get(),
            'periodoSeleccionado' => PeriodoLectivo::find($periodoFiltro),
            'filtros'            => ['periodo_id' => $periodoFiltro, 'curso_id' => $cursoFiltro],
        ]);
    }

    public function store(FasePpeRequest $request)
    {
        DB::transaction(function () use ($request) {
            $ultimoOrden = FasePpe::where('periodo_lectivo_id', $request->periodo_lectivo_id)
                ->where('curso_id', $request->curso_id)
                ->max('orden') ?? 0;

            FasePpe::create([
                'periodo_lectivo_id' => $request->periodo_lectivo_id,
                'curso_id'           => $request->curso_id,
                'nombre'             => $request->nombre,
                'descripcion'        => $request->descripcion,
                'orden'              => $ultimoOrden + 1,
                'fecha_inicio'       => $request->fecha_inicio,
                'fecha_fin'          => $request->fecha_fin,
                'estado'             => $request->estado,
            ]);

            $this->recalcularBitacoras($request->periodo_lectivo_id, $request->curso_id);
        });

        return redirect()->back()->with('success', 'Fase creada. Se generaron 5 bitácoras automáticamente.');
    }

    public function update(FasePpeRequest $request, FasePpe $fase)
    {
        $fase->update([
            'nombre'      => $request->nombre,
            'descripcion' => $request->descripcion,
            'fecha_inicio' => $request->fecha_inicio,
            'fecha_fin'   => $request->fecha_fin,
            'estado'      => $request->estado,
        ]);

        return redirect()->back()->with('success', 'Fase actualizada.');
    }

    public function reordenar(Request $request)
    {
        $request->validate([
            'fases'         => 'required|array',
            'fases.*.id'    => 'required|exists:fases_ppe,id',
            'fases.*.orden' => 'required|integer|min:1',
        ]);

        DB::transaction(function () use ($request) {
            foreach ($request->fases as $item) {
                FasePpe::where('id', $item['id'])->update(['orden' => $item['orden']]);
            }
            $fase = FasePpe::find($request->fases[0]['id']);
            $this->recalcularBitacoras($fase->periodo_lectivo_id, $fase->curso_id);
        });

        return redirect()->back()->with('success', 'Orden actualizado y bitácoras renumeradas.');
    }

    public function destroy(FasePpe $fase)
    {
        $stats = $fase->stats;
        if ($stats['actividades'] > 0 || $stats['bitacoras_entregadas'] > 0) {
            return redirect()->back()->with('error',
                'No se puede eliminar: la fase tiene actividades o bitácoras entregadas.');
        }

        DB::transaction(function () use ($fase) {
            $periodoId = $fase->periodo_lectivo_id;
            $cursoId   = $fase->curso_id;

            $fase->bitacorasConfig()->delete();
            $fase->delete();

            FasePpe::where('periodo_lectivo_id', $periodoId)
                ->where('curso_id', $cursoId)
                ->orderBy('orden')
                ->get()
                ->each(fn($f, $i) => $f->update(['orden' => $i + 1]));

            $this->recalcularBitacoras($periodoId, $cursoId);
        });

        return redirect()->back()->with('success', 'Fase eliminada y bitácoras renumeradas.');
    }

    private function recalcularBitacoras(int $periodoId, int $cursoId): void
    {
        $fases = FasePpe::where('periodo_lectivo_id', $periodoId)
            ->where('curso_id', $cursoId)
            ->orderBy('orden')
            ->get();

        foreach ($fases as $fase) {
            $numeroInicio = ($fase->orden - 1) * 5 + 1;
            for ($i = 1; $i <= 5; $i++) {
                $numeroGlobal = $numeroInicio + ($i - 1);
                BitacoraConfig::updateOrCreate(
                    ['fase_ppe_id' => $fase->id, 'numero_en_fase' => $i],
                    [
                        'numero_global' => $numeroGlobal,
                        'nombre'        => "Bitácora {$numeroGlobal}",
                        'estado'        => 'pendiente',
                    ]
                );
            }
        }
    }
}
