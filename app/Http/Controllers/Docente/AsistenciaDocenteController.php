<?php

namespace App\Http\Controllers\Docente;

use App\Http\Controllers\Controller;
use App\Models\Asistencia;
use App\Models\PeriodoLectivo;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AsistenciaDocenteController extends Controller
{
    public function index(Request $request)
    {
        $docente       = auth()->user();
        $periodoActivo = PeriodoLectivo::where('activo', true)->first();
        $cursoId       = $request->get('curso_id');
        $fecha         = $request->get('fecha', now()->format('Y-m-d'));

        $cursosAsignados = DB::table('estudiante_curso')
            ->join('cursos', 'cursos.id', '=', 'estudiante_curso.curso_id')
            ->where('estudiante_curso.docente_id', $docente->id)
            ->where('estudiante_curso.periodo_lectivo_id', $periodoActivo?->id)
            ->select('cursos.id', 'cursos.nombre', 'cursos.paralelo')
            ->distinct()
            ->get();

        $cursoSeleccionado = $cursoId
            ? $cursosAsignados->firstWhere('id', (int) $cursoId)
            : $cursosAsignados->first();

        $estudiantes = [];
        if ($cursoSeleccionado) {
            $estudiantes = User::role('estudiante')
                ->whereHas('cursos', fn ($q) =>
                    $q->where('curso_id', $cursoSeleccionado->id)
                      ->where('estudiante_curso.docente_id', $docente->id)
                      ->where('estudiante_curso.periodo_lectivo_id', $periodoActivo?->id)
                )
                ->get()
                ->map(function ($est) use ($cursoSeleccionado, $periodoActivo, $fecha) {
                    $asistencia = Asistencia::where('estudiante_id', $est->id)
                        ->where('curso_id', $cursoSeleccionado->id)
                        ->where('fecha', $fecha)
                        ->first();

                    $resumenMes = Asistencia::where('estudiante_id', $est->id)
                        ->where('curso_id', $cursoSeleccionado->id)
                        ->whereMonth('fecha', now()->month)
                        ->whereYear('fecha', now()->year)
                        ->get();

                    return [
                        'id'               => $est->id,
                        'nombre_completo'  => $est->nombre_completo,
                        'numero_matricula' => $est->numero_matricula,
                        'foto'             => $est->foto,
                        'foto_url'         => $est->foto_url,
                        'asistencia_hoy'   => $asistencia ? [
                            'id'          => $asistencia->id,
                            'estado'      => $asistencia->estado,
                            'observacion' => $asistencia->observacion,
                        ] : null,
                        'resumen_mes' => [
                            'presentes'  => $resumenMes->where('estado', 'presente')->count(),
                            'ausentes'   => $resumenMes->where('estado', 'ausente')->count(),
                            'tardanzas'  => $resumenMes->where('estado', 'tardanza')->count(),
                            'porcentaje' => $resumenMes->count() > 0
                                ? round($resumenMes->where('estado', 'presente')->count()
                                    / $resumenMes->count() * 100)
                                : null,
                        ],
                    ];
                })
                ->sortBy('nombre_completo')
                ->values();
        }

        $fechasRegistradas = $cursoSeleccionado
            ? Asistencia::where('registrado_por', $docente->id)
                ->where('curso_id', $cursoSeleccionado->id)
                ->where('periodo_lectivo_id', $periodoActivo?->id)
                ->select('fecha', DB::raw('count(*) as total'))
                ->groupBy('fecha')
                ->orderBy('fecha', 'desc')
                ->take(30)
                ->get()
                ->map(fn ($r) => ['fecha' => $r->fecha, 'total' => $r->total])
            : collect([]);

        return Inertia::render('Docente/Asistencia/Index', [
            'estudiantes'       => $estudiantes,
            'cursosAsignados'   => $cursosAsignados,
            'cursoSeleccionado' => $cursoSeleccionado,
            'periodoActivo'     => $periodoActivo,
            'fechaSeleccionada' => $fecha,
            'fechasRegistradas' => $fechasRegistradas->values(),
            'yaRegistrada'      => collect($estudiantes)->whereNotNull('asistencia_hoy')->count() > 0,
        ]);
    }

    public function registrar(Request $request)
    {
        $request->validate([
            'curso_id'                       => 'required|exists:cursos,id',
            'fecha'                          => 'required|date|before_or_equal:today',
            'asistencias'                    => 'required|array|min:1',
            'asistencias.*.estudiante_id'    => 'required|exists:users,id',
            'asistencias.*.estado'           => 'required|in:presente,ausente,tardanza,justificado',
            'asistencias.*.observacion'      => 'nullable|string|max:300',
        ], [
            'fecha.before_or_equal' => 'No puedes registrar asistencia en fechas futuras',
            'asistencias.min'       => 'Debes registrar al menos un estudiante',
        ]);

        $docente       = auth()->user();
        $periodoActivo = PeriodoLectivo::where('activo', true)->first();

        DB::transaction(function () use ($request, $docente, $periodoActivo) {
            foreach ($request->asistencias as $item) {
                Asistencia::updateOrCreate(
                    [
                        'estudiante_id' => $item['estudiante_id'],
                        'curso_id'      => $request->curso_id,
                        'fecha'         => $request->fecha,
                    ],
                    [
                        'periodo_lectivo_id' => $periodoActivo?->id,
                        'registrado_por'     => $docente->id,
                        'estado'             => $item['estado'],
                        'observacion'        => $item['observacion'] ?? null,
                    ]
                );
            }
        });

        $total = count($request->asistencias);
        return redirect()->back()->with('success',
            "Asistencia registrada para {$total} estudiantes.");
    }
}
