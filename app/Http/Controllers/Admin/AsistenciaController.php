<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Asistencia;
use App\Models\Curso;
use App\Models\PeriodoLectivo;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AsistenciaController extends Controller
{
    public function index(Request $request)
    {
        $periodoActivo = PeriodoLectivo::where('activo', true)->first();

        $fechaDesde = $request->input('fecha_desde', now()->startOfMonth()->toDateString());
        $fechaHasta = $request->input('fecha_hasta', now()->toDateString());
        $docenteId  = $request->input('docente_id');
        $cursoId    = $request->input('curso_id');

        $query = Asistencia::with([
            'estudiante:id,nombres,apellidos,numero_matricula',
            'curso:id,nombre,paralelo',
            'registradoPor:id,nombres,apellidos,name',
            'corregidoPor:id,nombres,apellidos,name',
        ])
        ->where('periodo_lectivo_id', $periodoActivo?->id)
        ->whereBetween('fecha', [$fechaDesde, $fechaHasta]);

        if ($docenteId) {
            $query->where('registrado_por', $docenteId);
        }
        if ($cursoId) {
            $query->where('curso_id', $cursoId);
        }

        $asistencias = $query->orderBy('fecha', 'desc')->orderBy('id')->get();

        $stats = [
            'total'       => $asistencias->count(),
            'presente'    => $asistencias->where('estado', 'presente')->count(),
            'ausente'     => $asistencias->where('estado', 'ausente')->count(),
            'tardanza'    => $asistencias->where('estado', 'tardanza')->count(),
            'justificado' => $asistencias->where('estado', 'justificado')->count(),
        ];
        $stats['porcentaje_asistencia'] = $stats['total'] > 0
            ? round(($stats['presente'] + $stats['tardanza'] + $stats['justificado']) / $stats['total'] * 100, 1)
            : 0;

        $resumenEstudiantes = $asistencias
            ->groupBy('estudiante_id')
            ->map(function ($registros) {
                $est         = $registros->first()->estudiante;
                $total       = $registros->count();
                $presente    = $registros->where('estado', 'presente')->count();
                $ausente     = $registros->where('estado', 'ausente')->count();
                $tardanza    = $registros->where('estado', 'tardanza')->count();
                $justificado = $registros->where('estado', 'justificado')->count();

                return [
                    'estudiante'            => $est,
                    'total'                 => $total,
                    'presente'              => $presente,
                    'ausente'               => $ausente,
                    'tardanza'              => $tardanza,
                    'justificado'           => $justificado,
                    'porcentaje_asistencia' => $total > 0
                        ? round(($presente + $tardanza + $justificado) / $total * 100, 1)
                        : 0,
                ];
            })
            ->sortByDesc('porcentaje_asistencia')
            ->values();

        $docentes = User::role('docente')
            ->select('id', 'nombres', 'apellidos', 'name')
            ->orderBy('apellidos')
            ->get();

        $cursos = Curso::select('id', 'nombre', 'paralelo')
            ->orderBy('nombre')
            ->get();

        return Inertia::render('Admin/Asistencia/Index', [
            'asistencias'        => $asistencias,
            'resumenEstudiantes' => $resumenEstudiantes,
            'stats'              => $stats,
            'docentes'           => $docentes,
            'cursos'             => $cursos,
            'periodoActivo'      => $periodoActivo,
            'filtros'            => [
                'fecha_desde' => $fechaDesde,
                'fecha_hasta' => $fechaHasta,
                'docente_id'  => $docenteId ? (int) $docenteId : null,
                'curso_id'    => $cursoId   ? (int) $cursoId   : null,
            ],
        ]);
    }

    public function update(Request $request, Asistencia $asistencia)
    {
        $validated = $request->validate([
            'estado'      => ['required', 'in:presente,ausente,tardanza,justificado'],
            'observacion' => ['nullable', 'string', 'max:500'],
        ]);

        $asistencia->update([
            'estado'        => $validated['estado'],
            'observacion'   => $validated['observacion'],
            'corregido_por' => auth()->id(),
            'corregido_at'  => now(),
        ]);

        return back()->with('success', 'Asistencia corregida correctamente.');
    }

    public function corregirMasivo(Request $request)
    {
        $validated = $request->validate([
            'registros'               => ['required', 'array', 'min:1'],
            'registros.*.id'          => ['required', 'integer', 'exists:asistencias,id'],
            'registros.*.estado'      => ['required', 'in:presente,ausente,tardanza,justificado'],
            'registros.*.observacion' => ['nullable', 'string', 'max:500'],
        ]);

        $corregidoPor = auth()->id();
        $corregidoAt  = now();

        DB::transaction(function () use ($validated, $corregidoPor, $corregidoAt) {
            foreach ($validated['registros'] as $reg) {
                Asistencia::where('id', $reg['id'])->update([
                    'estado'        => $reg['estado'],
                    'observacion'   => $reg['observacion'] ?? null,
                    'corregido_por' => $corregidoPor,
                    'corregido_at'  => $corregidoAt,
                ]);
            }
        });

        $n = count($validated['registros']);
        return back()->with('success', "{$n} registro(s) de asistencia corregidos correctamente.");
    }
}
