<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bitacora;
use App\Models\BitacoraConfig;
use App\Models\Curso;
use App\Models\PeriodoLectivo;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class BitacoraAdminController extends Controller
{
    public function index(Request $request)
    {
        $periodoActivo = PeriodoLectivo::where('activo', true)->first();

        $cursoFiltro   = $request->get('curso_id');
        $docenteFiltro = $request->get('docente_id');
        $estadoFiltro  = $request->get('estado');
        $bitacoraNum   = $request->get('bitacora_num');

        $bitacoras = Bitacora::with([
            'estudiante:id,nombres,apellidos,numero_matricula',
            'config.fase',
            'curso:id,nombre,paralelo',
            'calificacion.docente:id,nombres,apellidos,name',
        ])
        ->where('periodo_lectivo_id', $periodoActivo?->id)
        ->when($cursoFiltro,   fn($q) => $q->where('curso_id', $cursoFiltro))
        ->when($estadoFiltro,  fn($q) => $q->where('estado', $estadoFiltro))
        ->when($bitacoraNum,   fn($q) => $q->whereHas('config',
            fn($q2) => $q2->where('numero_global', $bitacoraNum)))
        ->when($docenteFiltro, fn($q) => $q->whereHas('calificacion',
            fn($q2) => $q2->where('docente_id', $docenteFiltro)))
        ->orderBy('created_at', 'desc')
        ->get();

        // Stats generales
        $stats = [
            'total_entregas' => $bitacoras->count(),
            'calificadas'    => $bitacoras->filter->calificada->count(),
            'pendientes'     => $bitacoras->reject->calificada->count(),
            'promedio_notas' => (float) round(
                $bitacoras->filter->calificada->avg('calificacion.nota') ?? 0, 2
            ),
        ];

        // Matrículas del período agrupadas por curso
        $inscripciones = DB::table('estudiante_curso as ec')
            ->where('ec.periodo_lectivo_id', $periodoActivo?->id)
            ->join('users as u', 'u.id', '=', 'ec.estudiante_id')
            ->select('ec.curso_id', 'u.id', 'u.nombres', 'u.apellidos', 'u.numero_matricula')
            ->get()
            ->groupBy('curso_id');

        // Agrupar por curso
        $porCurso = $bitacoras->groupBy('curso_id')
            ->map(fn($items, $cursoId) => [
                'curso'        => $items->first()->curso,
                'matriculados' => $inscripciones->get((string) $cursoId, collect())->values(),
                'bitacoras'    => $items->groupBy(fn($b) => (string) $b->config?->numero_global),
                'stats'        => [
                    'total'      => $items->count(),
                    'calificadas'=> $items->filter->calificada->count(),
                    'promedio'   => round($items->filter->calificada->avg('calificacion.nota') ?? 0, 2),
                ],
            ])
            ->values();

        // Agrupar por docente (solo bitácoras calificadas)
        $porDocente = $bitacoras->filter->calificada
            ->groupBy('calificacion.docente_id')
            ->map(fn($items) => [
                'docente'   => $items->first()->calificacion?->docente,
                'bitacoras' => $items->values(),
                'stats'     => [
                    'total'     => $items->count(),
                    'promedio'  => round($items->avg('calificacion.nota') ?? 0, 2),
                    'aprobados' => $items->filter(fn($b) => (float) $b->calificacion?->nota >= 7)->count(),
                ],
            ])
            ->values();

        return Inertia::render('Admin/Bitacoras/Index', [
            'porCurso'     => $porCurso,
            'porDocente'   => $porDocente,
            'stats'        => $stats,
            'cursos'       => Curso::orderBy('nombre')->get(['id', 'nombre', 'paralelo']),
            'docentes'     => User::role('docente')->select('id', 'nombres', 'apellidos')->get(),
            'periodoActivo'=> $periodoActivo,
            'filtros'      => [
                'curso_id'    => $cursoFiltro    ? (int) $cursoFiltro    : null,
                'docente_id'  => $docenteFiltro  ? (int) $docenteFiltro  : null,
                'estado'      => $estadoFiltro,
                'bitacora_num'=> $bitacoraNum    ? (int) $bitacoraNum    : null,
            ],
        ]);
    }

    public function descargar(Bitacora $bitacora)
    {
        if (!Storage::exists($bitacora->archivo_path)) {
            return redirect()->back()->with('error', 'Archivo no encontrado en el servidor.');
        }
        return Storage::download($bitacora->archivo_path, $bitacora->archivo_nombre);
    }

    public function exportarExcel(Request $request)
    {
        $periodoActivo = PeriodoLectivo::where('activo', true)->first();

        $bitacoras = Bitacora::with(['estudiante', 'config.fase', 'curso', 'calificacion.docente'])
            ->where('periodo_lectivo_id', $periodoActivo?->id)
            ->when($request->curso_id, fn($q) => $q->where('curso_id', $request->curso_id))
            ->orderBy('created_at', 'desc')
            ->get();

        $filename = 'bitacoras_' . now()->format('Y-m-d') . '.csv';
        $headers  = [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($bitacoras) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF) . chr(0xBB) . chr(0xBF)); // BOM para Excel

            fputcsv($file, [
                'Bitácora N°', 'Estudiante', 'Matrícula', 'Curso',
                'Fase', 'Estado', 'Fecha Entrega',
                'Nota', 'Justificación', 'Docente Calificador',
            ]);

            foreach ($bitacoras as $b) {
                fputcsv($file, [
                    $b->config?->numero_global ?? '—',
                    $b->estudiante?->nombre_completo ?? '—',
                    $b->estudiante?->numero_matricula ?? '—',
                    $b->curso?->nombre ?? '—',
                    $b->config?->fase?->nombre ?? '—',
                    ucfirst($b->estado),
                    $b->fecha_entrega?->format('d/m/Y H:i') ?? '—',
                    $b->calificacion?->nota ?? 'Sin calificar',
                    $b->calificacion?->justificacion ?? '—',
                    $b->calificacion?->docente?->nombre_completo ?? '—',
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function exportarPdf(Request $request)
    {
        $periodoActivo = PeriodoLectivo::where('activo', true)->first();

        $cursos = Curso::with(['bitacoras' => fn($q) =>
            $q->with(['estudiante', 'config', 'calificacion.docente'])
              ->where('periodo_lectivo_id', $periodoActivo?->id)
              ->when($request->curso_id, fn($q2) => $q2->where('curso_id', $request->curso_id))
        ])->orderBy('nombre')->get();

        $pdf = Pdf::loadView('pdf.reporte-bitacoras', [
            'cursos'        => $cursos,
            'periodoActivo' => $periodoActivo,
            'generadoEn'    => now()->format('d/m/Y H:i'),
        ]);

        $pdf->setPaper('A4', 'landscape');
        return $pdf->download('reporte_bitacoras_' . now()->format('Y-m-d') . '.pdf');
    }
}
