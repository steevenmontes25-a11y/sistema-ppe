<?php

namespace App\Http\Controllers\Estudiante;

use App\Http\Controllers\Controller;
use App\Models\Curso;
use App\Models\FasePpe;
use App\Models\PeriodoLectivo;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MisNotasController extends Controller
{
    public function index()
    {
        $estudiante    = auth()->user();
        $periodoActivo = PeriodoLectivo::where('activo', true)->first();

        $matricula = DB::table('estudiante_curso')
            ->where('estudiante_id', $estudiante->id)
            ->where('periodo_lectivo_id', $periodoActivo?->id)
            ->first();

        if (!$matricula) {
            return Inertia::render('Estudiante/MisNotas/Index', [
                'fases' => [], 'stats' => null, 'sinMatricula' => true,
            ]);
        }

        $fases = FasePpe::with([
            'bitacorasConfig' => fn ($q) => $q->orderBy('numero_en_fase')
                ->with(['actividad', 'entregas' => fn ($q2) =>
                    $q2->where('estudiante_id', $estudiante->id)
                       ->with('calificacion.docente:id,nombres,apellidos'),
                ]),
        ])
        ->where('curso_id', $matricula->curso_id)
        ->where('periodo_lectivo_id', $periodoActivo->id)
        ->orderBy('orden')
        ->get()
        ->map(function ($fase) {
            $bitacoras = $fase->bitacorasConfig->map(function ($config) {
                $entrega      = $config->entregas->first();
                $calificacion = $entrega?->calificacion;

                return [
                    'numero_global'   => $config->numero_global,
                    'nombre'          => $config->nombre,
                    'actividad_titulo' => $config->actividad?->titulo,
                    'puntaje_maximo'  => $config->actividad?->puntaje_maximo ?? 10,
                    'fecha_entrega'   => optional($config->actividad?->fecha_entrega)->toDateString(),
                    'entregada'       => (bool) $entrega,
                    'fecha_entregada' => $entrega?->fecha_entrega?->toDateTimeString(),
                    'calificacion'    => $calificacion ? [
                        'nota'               => $calificacion->nota,
                        'justificacion'      => $calificacion->justificacion,
                        'fecha_calificacion' => optional($calificacion->fecha_calificacion)->toDateString(),
                        'docente'            => trim(($calificacion->docente?->nombres ?? '')
                                                . ' ' . ($calificacion->docente?->apellidos ?? '')),
                    ] : null,
                    'estado' => ! $entrega ? 'sin_entregar'
                        : (! $calificacion ? 'pendiente' : 'calificada'),
                ];
            });

            $notas = $bitacoras->filter(fn ($b) => $b['calificacion'])
                               ->pluck('calificacion.nota');

            return [
                'id'              => $fase->id,
                'nombre'          => $fase->nombre,
                'orden'           => $fase->orden,
                'rango_bitacoras' => $fase->rango_bitacoras,
                'bitacoras'       => $bitacoras,
                'stats'           => [
                    'total'        => $bitacoras->count(),
                    'calificadas'  => $notas->count(),
                    'pendientes'   => $bitacoras->where('estado', 'pendiente')->count(),
                    'sin_entregar' => $bitacoras->where('estado', 'sin_entregar')->count(),
                    'promedio'     => $notas->count() > 0 ? round($notas->avg(), 2) : null,
                    'mejor_nota'   => $notas->count() > 0 ? $notas->max() : null,
                    'menor_nota'   => $notas->count() > 0 ? $notas->min() : null,
                ],
            ];
        });

        $todasNotas = $fases->flatMap(fn ($f) =>
            collect($f['bitacoras'])->filter(fn ($b) => $b['calificacion'])
                                    ->pluck('calificacion.nota')
        );
        $totalBitacoras = $fases->sum(fn ($f) => $f['stats']['total']);

        $stats = [
            'promedio_global'   => $todasNotas->count() > 0 ? round($todasNotas->avg(), 2) : null,
            'mejor_nota'        => $todasNotas->count() > 0 ? $todasNotas->max() : null,
            'total_calificadas' => $todasNotas->count(),
            'total_bitacoras'   => $totalBitacoras,
            'aprobadas'         => $todasNotas->filter(fn ($n) => $n >= 7)->count(),
            'reprobadas'        => $todasNotas->filter(fn ($n) => $n < 7)->count(),
            'porcentaje_avance' => $totalBitacoras > 0
                ? round($todasNotas->count() / $totalBitacoras * 100) : 0,
        ];

        return Inertia::render('Estudiante/MisNotas/Index', [
            'fases'         => $fases,
            'stats'         => $stats,
            'periodoActivo' => $periodoActivo,
            'sinMatricula'  => false,
            'curso'         => Curso::find($matricula->curso_id, ['id', 'nombre']),
        ]);
    }
}
