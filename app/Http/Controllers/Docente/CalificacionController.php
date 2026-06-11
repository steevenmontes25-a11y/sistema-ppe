<?php

namespace App\Http\Controllers\Docente;

use App\Http\Controllers\Controller;
use App\Models\Bitacora;
use App\Models\BitacoraConfig;
use App\Models\Calificacion;
use App\Models\FasePpe;
use App\Models\PeriodoLectivo;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CalificacionController extends Controller
{
    public function index(Request $request)
    {
        $docente        = auth()->user();
        $periodoActivo  = PeriodoLectivo::where('activo', true)->first();
        $cursoFiltro    = $request->get('curso_id');
        $filtroEstado   = $request->get('estado', 'todas');

        $cursosAsignados = DB::table('estudiante_curso')
            ->join('cursos', 'cursos.id', '=', 'estudiante_curso.curso_id')
            ->where('estudiante_curso.docente_id', $docente->id)
            ->where('estudiante_curso.periodo_lectivo_id', $periodoActivo?->id)
            ->select('cursos.id', 'cursos.nombre')
            ->distinct()
            ->get();

        $cursoIds = $cursoFiltro
            ? [(int) $cursoFiltro]
            : $cursosAsignados->pluck('id')->toArray();

        $fases = FasePpe::with([
            'curso',
            'bitacorasConfig'          => fn ($q) => $q->orderBy('numero_en_fase'),
            'bitacorasConfig.actividad',
        ])
        ->whereIn('curso_id', $cursoIds)
        ->where('periodo_lectivo_id', $periodoActivo?->id)
        ->orderBy('curso_id')
        ->orderBy('orden')
        ->get()
        ->map(function ($fase) use ($docente, $filtroEstado, $periodoActivo) {

            $estudiantesDelCurso = User::role('estudiante')
                ->whereHas('cursos', fn ($q) =>
                    $q->where('curso_id', $fase->curso_id)
                      ->where('estudiante_curso.docente_id', $docente->id)
                      ->where('estudiante_curso.periodo_lectivo_id', $periodoActivo?->id)
                )
                ->get(['id', 'nombres', 'apellidos', 'numero_matricula', 'foto']);

            $bitacoras = $fase->bitacorasConfig->map(function ($config) use ($estudiantesDelCurso, $filtroEstado) {

                $entregas = Bitacora::with('calificacion')
                    ->where('bitacora_config_id', $config->id)
                    ->whereIn('estudiante_id', $estudiantesDelCurso->pluck('id'))
                    ->get()
                    ->keyBy('estudiante_id');

                $filas = $estudiantesDelCurso->map(function ($est) use ($entregas) {
                    $entrega = $entregas->get($est->id);
                    return [
                        'estudiante' => [
                            'id'               => $est->id,
                            'nombre_completo'  => $est->nombre_completo,
                            'numero_matricula' => $est->numero_matricula,
                            'foto_url'         => $est->foto_url,
                        ],
                        'entrega' => $entrega ? [
                            'id'              => $entrega->id,
                            'archivo_path'    => $entrega->archivo_path,
                            'archivo_nombre'  => $entrega->archivo_nombre,
                            'archivo_tipo'    => $entrega->archivo_tipo,
                            'archivo_tamanio' => $entrega->archivo_tamanio,
                            'archivo_url'     => $entrega->archivo_url,
                            'descripcion'     => $entrega->descripcion,
                            'fecha_entrega'   => $entrega->fecha_entrega,
                        ] : null,
                        'calificacion' => $entrega?->calificacion ? [
                            'id'                 => $entrega->calificacion->id,
                            'nota'               => $entrega->calificacion->nota,
                            'justificacion'      => $entrega->calificacion->justificacion,
                            'fecha_calificacion' => $entrega->calificacion->fecha_calificacion,
                        ] : null,
                        'estado' => ! $entrega ? 'sin_entregar'
                            : (! $entrega->calificacion ? 'pendiente' : 'calificada'),
                    ];
                });

                if ($filtroEstado === 'pendientes') {
                    $filas = $filas->filter(fn ($f) => $f['estado'] === 'pendiente');
                } elseif ($filtroEstado === 'calificadas') {
                    $filas = $filas->filter(fn ($f) => $f['estado'] === 'calificada');
                }

                $calificadasCount = $entregas->filter(fn ($e) => $e->calificacion)->count();
                $promedio = $calificadasCount > 0
                    ? round($entregas->filter(fn ($e) => $e->calificacion)
                        ->avg(fn ($e) => $e->calificacion->nota), 2)
                    : null;

                return [
                    'config' => [
                        'id'             => $config->id,
                        'numero_en_fase' => $config->numero_en_fase,
                        'numero_global'  => $config->numero_global,
                        'nombre'         => $config->nombre,
                        'estado'         => $config->estado,
                        'actividad'      => $config->actividad ? [
                            'id'                 => $config->actividad->id,
                            'titulo'             => $config->actividad->titulo,
                            'fecha_finalizacion' => $config->actividad->fecha_finalizacion,
                        ] : null,
                    ],
                    'filas'       => $filas->values(),
                    'total'       => $estudiantesDelCurso->count(),
                    'entregadas'  => $entregas->count(),
                    'calificadas' => $calificadasCount,
                    'promedio'    => $promedio,
                ];
            })->filter(fn ($b) => $b['filas']->count() > 0 || $filtroEstado === 'todas');

            return [
                'fase'      => $fase->only(['id', 'nombre', 'orden', 'estado']),
                'curso'     => $fase->curso->only(['id', 'nombre']),
                'bitacoras' => $bitacoras->values(),
                'rango'     => $fase->rango_bitacoras,
            ];
        })->filter(fn ($f) => $f['bitacoras']->count() > 0 || $filtroEstado === 'todas');

        $stats = [
            'total_entregas'  => count($cursoIds) > 0
                ? Bitacora::whereHas('config.fase', fn ($q) =>
                    $q->whereIn('curso_id', $cursoIds)
                      ->where('periodo_lectivo_id', $periodoActivo?->id))->count()
                : 0,
            'calificadas'     => Calificacion::where('docente_id', $docente->id)->count(),
            'pendientes'      => count($cursoIds) > 0
                ? Bitacora::whereHas('config.fase', fn ($q) =>
                    $q->whereIn('curso_id', $cursoIds)
                      ->where('periodo_lectivo_id', $periodoActivo?->id))
                    ->doesntHave('calificacion')->count()
                : 0,
            'promedio_global' => round(
                Calificacion::where('docente_id', $docente->id)->avg('nota') ?? 0, 2
            ),
        ];

        return Inertia::render('Docente/Calificaciones/Index', [
            'fases'           => $fases->values(),
            'cursosAsignados' => $cursosAsignados,
            'periodoActivo'   => $periodoActivo,
            'stats'           => $stats,
            'filtros'         => [
                'curso_id' => $cursoFiltro,
                'estado'   => $filtroEstado,
            ],
        ]);
    }

    public function calificar(Request $request)
    {
        $request->validate([
            'bitacora_id'   => 'required|exists:bitacoras,id',
            'nota'          => 'required|numeric|min:0|max:10',
            'justificacion' => 'required|string|min:10|max:1000',
        ], [
            'nota.min'               => 'La nota mínima es 0',
            'nota.max'               => 'La nota máxima es 10',
            'justificacion.min'      => 'La justificación debe tener al menos 10 caracteres',
            'justificacion.required' => 'La justificación es obligatoria',
        ]);

        Calificacion::updateOrCreate(
            ['bitacora_id' => $request->bitacora_id],
            [
                'docente_id'         => auth()->id(),
                'nota'               => $request->nota,
                'justificacion'      => $request->justificacion,
                'fecha_calificacion' => now(),
            ]
        );

        Bitacora::find($request->bitacora_id)->update(['estado' => 'revisada']);

        return redirect()->back()->with('success', 'Calificación guardada correctamente.');
    }

    public function calificarNoEntrega(Request $request)
    {
        $request->validate([
            'bitacora_config_id' => 'required|exists:bitacoras_config,id',
            'estudiante_id'      => 'required|exists:users,id',
            'justificacion'      => 'nullable|string|max:500',
        ]);

        $config = BitacoraConfig::with(['actividad', 'fase'])->find($request->bitacora_config_id);

        if ($config->actividad && $config->actividad->fecha_finalizacion >= now()->toDateString()) {
            return redirect()->back()->with('error',
                'La actividad aún no ha vencido. Espera a la fecha de finalización.');
        }

        $entregaExistente = Bitacora::where('bitacora_config_id', $request->bitacora_config_id)
            ->where('estudiante_id', $request->estudiante_id)
            ->first();

        if ($entregaExistente) {
            return redirect()->back()->with('error',
                'El estudiante ya tiene un registro para esta bitácora. Califica desde la entrega.');
        }

        $periodoActivo = PeriodoLectivo::where('activo', true)->first();

        DB::transaction(function () use ($request, $config, $periodoActivo) {
            $bitacora = Bitacora::create([
                'estudiante_id'      => $request->estudiante_id,
                'bitacora_config_id' => $request->bitacora_config_id,
                'curso_id'           => $config->fase->curso_id,
                'periodo_lectivo_id' => $periodoActivo?->id,
                'archivo_path'       => 'sin_entrega',
                'archivo_nombre'     => 'Sin entrega',
                'archivo_tipo'       => 'ninguno',
                'estado'             => 'revisada',
                'fecha_entrega'      => now(),
                'descripcion'        => 'Registrado automáticamente por no entrega',
            ]);

            Calificacion::create([
                'bitacora_id'        => $bitacora->id,
                'docente_id'         => auth()->id(),
                'nota'               => 2,
                'justificacion'      => $request->justificacion
                    ?? 'Nota por no entrega de bitácora en el plazo establecido.',
                'fecha_calificacion' => now(),
            ]);
        });

        return redirect()->back()->with('success', 'Nota por no entrega registrada correctamente.');
    }
}
