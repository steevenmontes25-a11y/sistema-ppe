<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PerfilController extends Controller
{
    public function show()
    {
        $user = auth()->user()->load('roles');
        $rol  = $user->getRoleNames()->first();

        $extra = match ($rol) {
            'estudiante' => [
                'curso'   => DB::table('estudiante_curso')
                    ->join('cursos', 'cursos.id', '=', 'estudiante_curso.curso_id')
                    ->join('periodos_lectivos', 'periodos_lectivos.id', '=', 'estudiante_curso.periodo_lectivo_id')
                    ->where('estudiante_curso.estudiante_id', $user->id)
                    ->where('periodos_lectivos.activo', true)
                    ->select('cursos.nombre as curso', 'periodos_lectivos.nombre as periodo')
                    ->first(),
                'docente' => DB::table('estudiante_curso')
                    ->join('users', 'users.id', '=', 'estudiante_curso.docente_id')
                    ->where('estudiante_curso.estudiante_id', $user->id)
                    ->whereNotNull('estudiante_curso.docente_id')
                    ->select('users.nombres', 'users.apellidos')
                    ->first(),
            ],
            'docente' => [
                'cursos_asignados' => DB::table('docente_curso')
                    ->join('cursos', 'cursos.id', '=', 'docente_curso.curso_id')
                    ->where('docente_curso.docente_id', $user->id)
                    ->pluck('cursos.nombre'),
            ],
            default => [],
        };

        $userData                    = $user->toArray();
        $userData['foto_url']        = $user->foto_url;
        $userData['nombre_completo'] = $user->nombre_completo;

        return Inertia::render('Perfil/Index', [
            'usuario' => array_merge($userData, $extra),
            'rol'     => $rol,
        ]);
    }

    public function update(Request $request)
    {
        $user = auth()->user();

        $request->validate([
            'nombres'   => 'required|string|max:100',
            'apellidos' => 'required|string|max:100',
            'email'     => 'required|email|unique:users,email,' . $user->id,
            'celular'   => 'nullable|string|max:15',
            'direccion' => 'nullable|string|max:255',
        ], [
            'email.unique' => 'Este correo ya está en uso',
        ]);

        $user->update(array_merge(
            $request->only(['nombres', 'apellidos', 'email', 'celular', 'direccion']),
            ['name' => trim($request->nombres . ' ' . $request->apellidos)]
        ));

        return redirect()->back()->with('success', 'Perfil actualizado correctamente.');
    }

    public function actualizarFoto(Request $request)
    {
        $request->validate([
            'foto' => 'required|image|mimes:jpg,jpeg,png,webp|max:2048',
        ], [
            'foto.max'   => 'La imagen no puede superar 2MB',
            'foto.mimes' => 'Solo se permiten imágenes JPG, PNG o WEBP',
        ]);

        $user = auth()->user();

        if ($user->foto && Storage::disk('public')->exists($user->foto)) {
            Storage::disk('public')->delete($user->foto);
        }

        $path = $request->file('foto')->store('fotos-perfil', 'public');
        $user->update(['foto' => $path]);

        return redirect()->back()->with('success', 'Foto actualizada.');
    }

    public function cambiarPassword(Request $request)
    {
        $user = auth()->user();

        $request->validate([
            'password_actual' => 'required',
            'password_nuevo'  => 'required|min:8|confirmed',
        ], [
            'password_nuevo.min'       => 'La contraseña debe tener al menos 8 caracteres',
            'password_nuevo.confirmed' => 'Las contraseñas no coinciden',
        ]);

        if (!Hash::check($request->password_actual, $user->password)) {
            return redirect()->back()->withErrors([
                'password_actual' => 'La contraseña actual no es correcta',
            ]);
        }

        $user->update(['password' => Hash::make($request->password_nuevo)]);

        return redirect()->back()->with('success', 'Contraseña cambiada correctamente.');
    }
}
