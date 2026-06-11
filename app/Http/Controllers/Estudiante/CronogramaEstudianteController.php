<?php

namespace App\Http\Controllers\Estudiante;

use App\Http\Controllers\Controller;
use App\Models\Bitacora;
use App\Models\BitacoraConfig;
use App\Models\Curso;
use App\Models\FasePpe;
use App\Models\PeriodoLectivo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CronogramaEstudianteController extends Controller
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
            return Inertia::render('Estudiante/Cronograma/Index', [
                'fases'         => [],
                'periodoActivo' => $periodoActivo,
                'sinMatricula'  => true,
                'curso'         => null,
            ]);
        }

        $fases = FasePpe::with([
            'bitacorasConfig' => fn ($q) => $q->orderBy('numero_en_fase')
                ->with(['actividad', 'entregas' => fn ($q2) =>
                    $q2->where('estudiante_id', $estudiante->id)
                       ->with('calificacion'),
                ]),
        ])
        ->where('curso_id', $matricula->curso_id)
        ->where('periodo_lectivo_id', $periodoActivo->id)
        ->orderBy('orden')
        ->get()
        ->map(function ($fase) {
            $bitacoras = $fase->bitacorasConfig->map(function ($config) {
                $entrega = $config->entregas->first();
                $hoy     = now();

                $estado = 'pendiente';
                if ($entrega) {
                    $estado = $entrega->calificacion ? 'calificada' : 'entregada';
                } elseif ($config->actividad && $config->actividad->fecha_finalizacion < $hoy) {
                    $estado = 'vencida';
                }

                $diasRestantes = null;
                if ($config->actividad?->fecha_entrega) {
                    $diasRestantes = (int) now()->startOfDay()
                        ->diffInDays($config->actividad->fecha_entrega->startOfDay(), false);
                }

                return [
                    'id'             => $config->id,
                    'numero_global'  => $config->numero_global,
                    'numero_en_fase' => $config->numero_en_fase,
                    'nombre'         => $config->nombre,
                    'estado'         => $estado,
                    'dias_restantes' => $diasRestantes,
                    'actividad'      => $config->actividad ? [
                        'id'                 => $config->actividad->id,
                        'titulo'             => $config->actividad->titulo,
                        'descripcion'        => $config->actividad->descripcion,
                        'tipo_entrega'       => $config->actividad->tipo_entrega,
                        'puntaje_maximo'     => $config->actividad->puntaje_maximo,
                        'fecha_inicio'       => optional($config->actividad->fecha_inicio)->toDateString(),
                        'fecha_entrega'      => optional($config->actividad->fecha_entrega)->toDateString(),
                        'fecha_finalizacion' => optional($config->actividad->fecha_finalizacion)->toDateString(),
                    ] : null,
                    'entrega' => $entrega ? [
                        'id'              => $entrega->id,
                        'archivo_nombre'  => $entrega->archivo_nombre,
                        'archivo_tipo'    => $entrega->archivo_tipo,
                        'archivo_path'    => $entrega->archivo_path,
                        'descripcion'     => $entrega->descripcion,
                        'fecha_entrega'   => $entrega->fecha_entrega?->toDateTimeString(),
                        'estado'          => $entrega->estado,
                        'calificacion'    => $entrega->calificacion ? [
                            'nota'               => $entrega->calificacion->nota,
                            'justificacion'      => $entrega->calificacion->justificacion,
                            'fecha_calificacion' => optional($entrega->calificacion->fecha_calificacion)->toDateString(),
                        ] : null,
                    ] : null,
                ];
            });

            return [
                'id'              => $fase->id,
                'nombre'          => $fase->nombre,
                'orden'           => $fase->orden,
                'estado'          => $fase->estado,
                'fecha_inicio'    => $fase->fecha_inicio?->toDateString(),
                'fecha_fin'       => $fase->fecha_fin?->toDateString(),
                'rango_bitacoras' => $fase->rango_bitacoras,
                'bitacoras'       => $bitacoras,
                'stats'           => [
                    'total'       => $bitacoras->count(),
                    'entregadas'  => $bitacoras->whereIn('estado', ['entregada', 'calificada'])->count(),
                    'calificadas' => $bitacoras->where('estado', 'calificada')->count(),
                    'pendientes'  => $bitacoras->where('estado', 'pendiente')->count(),
                    'vencidas'    => $bitacoras->where('estado', 'vencida')->count(),
                ],
            ];
        });

        return Inertia::render('Estudiante/Cronograma/Index', [
            'fases'         => $fases,
            'periodoActivo' => $periodoActivo,
            'sinMatricula'  => false,
            'curso'         => Curso::find($matricula->curso_id, ['id', 'nombre']),
        ]);
    }

    public function entregar(Request $request)
    {
        $estudiante    = auth()->user();
        $periodoActivo = PeriodoLectivo::where('activo', true)->first();

        $request->validate([
            'bitacora_config_id' => 'required|exists:bitacoras_config,id',
            'descripcion'        => 'nullable|string|max:1000',
            'tipo_entrega'       => 'required|in:pdf,foto,texto',
            'archivo'            => 'required_unless:tipo_entrega,texto|file|max:10240',
            'texto_contenido'    => 'required_if:tipo_entrega,texto|nullable|string|max:5000',
        ], [
            'archivo.required_unless'     => 'Debes subir un archivo.',
            'archivo.max'                 => 'El archivo no puede superar 10 MB.',
            'texto_contenido.required_if' => 'Debes escribir el contenido de la bitácora.',
        ]);

        $config = BitacoraConfig::with(['actividad', 'fase'])->findOrFail($request->bitacora_config_id);

        if ($config->actividad?->fecha_finalizacion && $config->actividad->fecha_finalizacion < now()) {
            return redirect()->back()->with('error', 'El plazo de entrega ha vencido.');
        }

        $entregaExistente = Bitacora::where('bitacora_config_id', $request->bitacora_config_id)
            ->where('estudiante_id', $estudiante->id)
            ->first();

        if ($entregaExistente) {
            return redirect()->back()->with('error',
                'Ya entregaste esta bitácora. No puedes volver a entregarla.');
        }

        $matricula = DB::table('estudiante_curso')
            ->where('estudiante_id', $estudiante->id)
            ->where('periodo_lectivo_id', $periodoActivo->id)
            ->first();

        $archivoPath    = null;
        $archivoNombre  = null;
        $archivoTipo    = $request->tipo_entrega;
        $archivoTamanio = null;

        if ($request->tipo_entrega === 'texto') {
            $contenido      = $request->texto_contenido;
            $nombre         = "bitacora_{$config->numero_global}_{$estudiante->id}.txt";
            $archivoPath    = "bitacoras/{$periodoActivo->id}/{$nombre}";
            Storage::disk('public')->put($archivoPath, $contenido);
            $archivoNombre  = "Bitacora_{$config->numero_global}_texto.txt";
            $archivoTamanio = strlen($contenido);
        } else {
            $file           = $request->file('archivo');
            $ext            = $file->getClientOriginalExtension();
            $nombre         = "bitacora_{$config->numero_global}_{$estudiante->id}_{$archivoTipo}.{$ext}";
            $archivoPath    = $file->storeAs("bitacoras/{$periodoActivo->id}", $nombre, 'public');
            $archivoNombre  = $file->getClientOriginalName();
            $archivoTamanio = $file->getSize();
        }

        Bitacora::create([
            'estudiante_id'      => $estudiante->id,
            'bitacora_config_id' => $request->bitacora_config_id,
            'curso_id'           => $matricula->curso_id,
            'periodo_lectivo_id' => $periodoActivo->id,
            'archivo_path'       => $archivoPath,
            'archivo_nombre'     => $archivoNombre,
            'archivo_tipo'       => $archivoTipo,
            'archivo_tamanio'    => $archivoTamanio,
            'descripcion'        => $request->descripcion,
            'estado'             => 'entregada',
            'fecha_entrega'      => now(),
        ]);

        return redirect()->back()->with('success',
            "Bitácora #{$config->numero_global} entregada correctamente.");
    }

    public function actualizar(Request $request, Bitacora $bitacora)
    {
        if ($bitacora->estudiante_id !== auth()->id()) {
            abort(403, 'No autorizado.');
        }

        if ($bitacora->calificacion) {
            return redirect()->back()->with('error',
                'No puedes editar una bitácora ya calificada.');
        }

        $config = $bitacora->config()->with('actividad')->first();
        if ($config->actividad?->fecha_finalizacion && $config->actividad->fecha_finalizacion < now()) {
            return redirect()->back()->with('error',
                'El plazo de la actividad ha vencido.');
        }

        $request->validate([
            'descripcion'     => 'nullable|string|max:1000',
            'tipo_entrega'    => 'required|in:pdf,foto,texto',
            'archivo'         => 'nullable|file|max:10240',
            'texto_contenido' => 'required_if:tipo_entrega,texto|nullable|string|max:5000',
        ], [
            'archivo.max'                 => 'El archivo no puede superar 10 MB.',
            'texto_contenido.required_if' => 'Debes escribir el contenido de la bitácora.',
        ]);

        if ($request->hasFile('archivo')) {
            if ($bitacora->archivo_path && $bitacora->archivo_path !== 'sin_entrega') {
                Storage::disk('public')->delete($bitacora->archivo_path);
            }
            $file        = $request->file('archivo');
            $ext         = $file->getClientOriginalExtension();
            $archivoTipo = $request->tipo_entrega;
            $userId      = auth()->id();
            $nombre      = "bitacora_{$config->numero_global}_{$userId}_{$archivoTipo}.{$ext}";
            $path        = $file->storeAs("bitacoras/{$bitacora->periodo_lectivo_id}", $nombre, 'public');

            $bitacora->update([
                'archivo_path'    => $path,
                'archivo_nombre'  => $file->getClientOriginalName(),
                'archivo_tipo'    => $archivoTipo,
                'archivo_tamanio' => $file->getSize(),
                'descripcion'     => $request->descripcion,
            ]);
        } elseif ($request->tipo_entrega === 'texto' && $request->texto_contenido) {
            Storage::disk('public')->put($bitacora->archivo_path, $request->texto_contenido);
            $bitacora->update(['descripcion' => $request->descripcion]);
        } else {
            $bitacora->update(['descripcion' => $request->descripcion]);
        }

        return redirect()->back()->with('success', 'Entrega actualizada correctamente.');
    }

    public function eliminar(Bitacora $bitacora)
    {
        if ($bitacora->estudiante_id !== auth()->id()) {
            abort(403, 'No autorizado.');
        }

        if ($bitacora->calificacion) {
            return redirect()->back()->with('error',
                'No puedes eliminar una bitácora ya calificada.');
        }

        $config = $bitacora->config()->with('actividad')->first();
        if ($config->actividad?->fecha_finalizacion && $config->actividad->fecha_finalizacion < now()) {
            return redirect()->back()->with('error',
                'El plazo ha vencido, no puedes eliminar la entrega.');
        }

        if ($bitacora->archivo_path && $bitacora->archivo_path !== 'sin_entrega') {
            Storage::disk('public')->delete($bitacora->archivo_path);
        }
        $bitacora->delete();

        return redirect()->back()->with('success', 'Entrega eliminada. Puedes volver a entregar.');
    }
}
