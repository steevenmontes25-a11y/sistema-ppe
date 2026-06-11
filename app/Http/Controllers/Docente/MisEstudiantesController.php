<?php

namespace App\Http\Controllers\Docente;

use App\Http\Controllers\Controller;
use App\Models\Asistencia;
use App\Models\Bitacora;
use App\Models\BitacoraConfig;
use App\Models\Calificacion;
use App\Models\PeriodoLectivo;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MisEstudiantesController extends Controller
{
    public function index(Request $request)
    {
        $docente       = auth()->user();
        $periodoActivo = PeriodoLectivo::where('activo', true)->first();
        $cursoFiltro   = $request->get('curso_id');

        $cursosAsignados = DB::table('estudiante_curso')
            ->join('cursos', 'cursos.id', '=', 'estudiante_curso.curso_id')
            ->where('estudiante_curso.docente_id', $docente->id)
            ->where('estudiante_curso.periodo_lectivo_id', $periodoActivo?->id)
            ->select('cursos.id', 'cursos.nombre', 'cursos.paralelo')
            ->distinct()
            ->get();

        $estudiantes = User::role('estudiante')
            ->whereHas('cursos', fn ($q) =>
                $q->where('estudiante_curso.docente_id', $docente->id)
                  ->where('estudiante_curso.periodo_lectivo_id', $periodoActivo?->id)
                  ->when($cursoFiltro, fn ($q2) => $q2->where('cursos.id', $cursoFiltro))
            )
            ->with(['cursos' => fn ($q) =>
                $q->where('estudiante_curso.periodo_lectivo_id', $periodoActivo?->id)
            ])
            ->get()
            ->map(function ($est) use ($periodoActivo) {
                $curso = $est->cursos->first();

                // ── Asistencia ───────────────────────────────────────────────
                $asistencias   = Asistencia::where('estudiante_id', $est->id)
                    ->where('periodo_lectivo_id', $periodoActivo?->id)
                    ->get();
                $totalAsist    = $asistencias->count();
                $presentes     = $asistencias->where('estado', 'presente')->count();
                $pctAsistencia = $totalAsist > 0
                    ? round($presentes / $totalAsist * 100) : 0;

                // ── Bitácoras ────────────────────────────────────────────────
                $totalBitacoras = BitacoraConfig::whereHas('fase',
                    fn ($q) => $q->where('curso_id', $curso?->id)
                                 ->where('periodo_lectivo_id', $periodoActivo?->id)
                )->count();
                $entregadas  = Bitacora::where('estudiante_id', $est->id)
                    ->where('periodo_lectivo_id', $periodoActivo?->id)
                    ->count();
                $calificadas = Calificacion::whereHas('bitacora',
                    fn ($q) => $q->where('estudiante_id', $est->id)
                                 ->where('periodo_lectivo_id', $periodoActivo?->id)
                )->count();
                $promedio = Calificacion::whereHas('bitacora',
                    fn ($q) => $q->where('estudiante_id', $est->id)
                                 ->where('periodo_lectivo_id', $periodoActivo?->id)
                )->avg('nota');

                // ── Últimas 10 asistencias (para modal) ──────────────────────
                $asistenciasRecientes = $asistencias
                    ->sortByDesc('fecha')
                    ->take(10)
                    ->map(fn ($a) => [
                        'fecha'       => $a->fecha?->format('d/m/Y'),
                        'estado'      => $a->estado,
                        'observacion' => $a->observacion,
                    ])->values();

                // ── Lista de bitácoras con estado (para modal) ────────────────
                $bitacorasLista = BitacoraConfig::whereHas('fase',
                    fn ($q) => $q->where('curso_id', $curso?->id)
                                 ->where('periodo_lectivo_id', $periodoActivo?->id)
                )
                ->with(['bitacoras' => fn ($q) =>
                    $q->where('estudiante_id', $est->id)->with('calificacion')
                ])
                ->orderBy('numero_global')
                ->get()
                ->map(function ($config) {
                    $bitacora = $config->bitacoras->first();
                    $calif    = $bitacora?->calificacion;
                    return [
                        'numero' => $config->numero_global,
                        'nombre' => $config->nombre,
                        'estado' => $bitacora
                            ? ($calif ? 'calificada' : 'entregada')
                            : 'pendiente',
                        'nota'  => $calif ? round((float) $calif->nota, 2) : null,
                        'fecha' => $bitacora?->fecha_entrega?->format('d/m/Y'),
                    ];
                });

                return [
                    'id'               => $est->id,
                    'nombres'          => $est->nombres,
                    'apellidos'        => $est->apellidos,
                    'nombre_completo'  => $est->nombre_completo,
                    'numero_matricula' => $est->numero_matricula,
                    'cedula'           => $est->cedula,
                    'email'            => $est->email,
                    'celular'          => $est->celular,
                    'sexo'             => $est->sexo,
                    'foto'             => $est->foto,
                    'foto_url'         => $est->foto_url,
                    'estado'           => $est->estado,
                    'curso'            => $curso ? [
                        'id'      => $curso->id,
                        'nombre'  => $curso->nombre,
                        'paralelo'=> $curso->paralelo ?? null,
                    ] : null,
                    'asistencia' => [
                        'total'        => $totalAsist,
                        'presentes'    => $presentes,
                        'ausentes'     => $asistencias->where('estado', 'ausente')->count(),
                        'tardanzas'    => $asistencias->where('estado', 'tardanza')->count(),
                        'justificados' => $asistencias->where('estado', 'justificado')->count(),
                        'porcentaje'   => $pctAsistencia,
                    ],
                    'bitacoras' => [
                        'total'      => $totalBitacoras,
                        'entregadas' => $entregadas,
                        'calificadas'=> $calificadas,
                        'promedio'   => $promedio ? round((float) $promedio, 2) : null,
                    ],
                    'asistencias_recientes' => $asistenciasRecientes,
                    'bitacoras_lista'       => $bitacorasLista,
                ];
            });

        $promedioGlobal = round(
            $estudiantes->map(fn ($e) => $e['bitacoras']['promedio'])
                ->filter(fn ($p) => $p !== null)
                ->avg() ?? 0,
            2
        );

        return Inertia::render('Docente/MisEstudiantes/Index', [
            'estudiantes'     => $estudiantes->values(),
            'cursosAsignados' => $cursosAsignados,
            'periodoActivo'   => $periodoActivo,
            'cursoFiltro'     => $cursoFiltro ? (int) $cursoFiltro : null,
            'stats'           => [
                'total'           => $estudiantes->count(),
                'activos'         => $estudiantes->where('estado', 'activo')->count(),
                'promedio_global' => $promedioGlobal,
                'asistencia_prom' => round(
                    $estudiantes->map(fn ($e) => $e['asistencia']['porcentaje'])->avg() ?? 0
                ),
            ],
        ]);
    }
}
