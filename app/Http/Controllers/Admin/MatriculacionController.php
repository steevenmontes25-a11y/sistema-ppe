<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\MatriculaRequest;
use App\Models\Asistencia;
use App\Models\Bitacora;
use App\Models\Calificacion;
use App\Models\Curso;
use App\Models\PeriodoLectivo;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class MatriculacionController extends Controller
{
    public function index(Request $request): Response
    {
        $periodoActivo = PeriodoLectivo::where('activo', true)->first()
            ?? PeriodoLectivo::orderByDesc('fecha_inicio')->first();

        $cursos = $periodoActivo
            ? Curso::where('periodo_lectivo_id', $periodoActivo->id)->orderBy('nombre')->get()
            : collect();

        $cursoFiltro = $request->get('curso_id');

        $estudiantes = User::role('estudiante')
            ->with([
                'cursos' => fn($q) => $q
                    ->when($periodoActivo, fn($q2) =>
                        $q2->where('estudiante_curso.periodo_lectivo_id', $periodoActivo->id)
                    )
                    ->select('cursos.id', 'cursos.nombre', 'cursos.paralelo'),
            ])
            ->when($cursoFiltro && $periodoActivo, function ($q) use ($cursoFiltro, $periodoActivo) {
                $q->whereHas('cursos', fn($q2) =>
                    $q2->where('estudiante_curso.curso_id', $cursoFiltro)
                       ->where('estudiante_curso.periodo_lectivo_id', $periodoActivo->id)
                );
            })
            ->orderBy('apellidos')
            ->orderBy('nombres')
            ->paginate(20)
            ->withQueryString();

        $docentes = User::role('docente')
            ->where('estado', 'activo')
            ->with('cursosDocente:id')
            ->get(['id', 'name', 'nombres', 'apellidos', 'email']);

        $stats = [
            'total'    => User::role('estudiante')->count(),
            'activos'  => User::role('estudiante')->where('estado', 'activo')->count(),
            'por_curso' => $cursos->map(fn($c) => [
                'id'     => $c->id,
                'nombre' => $c->nombre,
                'count'  => DB::table('estudiante_curso')
                    ->where('curso_id', $c->id)
                    ->when($periodoActivo, fn($q) => $q->where('periodo_lectivo_id', $periodoActivo->id))
                    ->count(),
            ]),
        ];

        return Inertia::render('Admin/Matriculacion/Index', [
            'estudiantes'   => $estudiantes,
            'cursos'        => $cursos,
            'docentes'      => $docentes,
            'periodoActivo' => $periodoActivo,
            'cursoFiltro'   => $cursoFiltro,
            'stats'         => $stats,
        ]);
    }

    public function store(MatriculaRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request) {
            $year  = now()->year;
            $count = User::role('estudiante')->count() + 1;
            $numeroMatricula = $request->numero_matricula
                ?: "PPE-{$year}-" . str_pad($count, 3, '0', STR_PAD_LEFT);

            $estudiante = User::create([
                'name'             => trim($request->nombres . ' ' . $request->apellidos),
                'nombres'          => $request->nombres,
                'apellidos'        => $request->apellidos,
                'numero_matricula' => $numeroMatricula,
                'cedula'           => $request->cedula,
                'sexo'             => $request->sexo,
                'direccion'        => $request->direccion,
                'email'            => $request->email,
                'celular'          => $request->celular,
                'password'         => Hash::make($request->cedula),
                'role'             => 'estudiante',
                'estado'           => 'activo',
            ]);

            $estudiante->assignRole('estudiante');

            $estudiante->cursos()->attach($request->curso_id, [
                'periodo_lectivo_id' => $request->periodo_lectivo_id,
                'docente_id'         => $request->docente_id,
                'fecha_matricula'    => now()->toDateString(),
                'estado'             => 'activo',
            ]);
        });

        return redirect()->back()->with(
            'success',
            'Estudiante matriculado correctamente. Contraseña temporal: cédula de identidad.'
        );
    }

    public function update(MatriculaRequest $request, User $estudiante): RedirectResponse
    {
        DB::transaction(function () use ($request, $estudiante) {
            $estudiante->update([
                'name'             => trim($request->nombres . ' ' . $request->apellidos),
                'nombres'          => $request->nombres,
                'apellidos'        => $request->apellidos,
                'numero_matricula' => $request->numero_matricula,
                'cedula'           => $request->cedula,
                'sexo'             => $request->sexo,
                'direccion'        => $request->direccion,
                'email'            => $request->email,
                'celular'          => $request->celular,
            ]);

            $periodoActivo = PeriodoLectivo::where('activo', true)->first();
            if ($periodoActivo) {
                DB::table('estudiante_curso')
                    ->where('estudiante_id', $estudiante->id)
                    ->where('curso_id', $request->curso_id)
                    ->where('periodo_lectivo_id', $periodoActivo->id)
                    ->update(['docente_id' => $request->docente_id]);
            }
        });

        return redirect()->back()->with('success', 'Datos del estudiante actualizados.');
    }

    public function darDeBaja(User $estudiante): RedirectResponse
    {
        $periodoActivo = PeriodoLectivo::where('activo', true)->first();

        $estudiante->update(['estado' => 'inactivo']);

        if ($periodoActivo) {
            DB::table('estudiante_curso')
                ->where('estudiante_id', $estudiante->id)
                ->where('periodo_lectivo_id', $periodoActivo->id)
                ->update(['estado' => 'inactivo']);
        }

        return redirect()->back()->with('success', 'Estudiante dado de baja correctamente.');
    }

    public function reactivar(User $estudiante): RedirectResponse
    {
        $periodoActivo = PeriodoLectivo::where('activo', true)->first();

        $estudiante->update(['estado' => 'activo']);

        if ($periodoActivo) {
            DB::table('estudiante_curso')
                ->where('estudiante_id', $estudiante->id)
                ->where('periodo_lectivo_id', $periodoActivo->id)
                ->update(['estado' => 'activo']);
        }

        return redirect()->back()->with('success', 'Estudiante reactivado correctamente.');
    }

    public function resetPassword(User $estudiante): RedirectResponse
    {
        $estudiante->update(['password' => Hash::make($estudiante->cedula)]);

        return redirect()->back()->with(
            'success',
            "Contraseña reseteada. Nueva contraseña: cédula del estudiante ({$estudiante->cedula})."
        );
    }

    public function destroy(User $estudiante): RedirectResponse
    {
        if (!$estudiante->hasRole('estudiante')) {
            return redirect()->back()->with('error', 'Acción no permitida.');
        }

        DB::transaction(function () use ($estudiante) {
            $estudiante->cursos()->detach();
            Asistencia::where('estudiante_id', $estudiante->id)->delete();
            Calificacion::whereHas('bitacora', fn ($q) =>
                $q->where('estudiante_id', $estudiante->id)
            )->delete();
            Bitacora::where('estudiante_id', $estudiante->id)->delete();
            $estudiante->delete();
        });

        return redirect()->back()->with('success', 'Estudiante eliminado permanentemente.');
    }
}
