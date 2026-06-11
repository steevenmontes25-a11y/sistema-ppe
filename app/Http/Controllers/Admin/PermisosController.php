<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class PermisosController extends Controller
{
    public function index()
    {
        $usuarios = User::role(['admin', 'docente'])
            ->with('roles')
            ->orderBy('name')
            ->get()
            ->map(fn($u) => [
                'id'            => $u->id,
                'nombre'        => $u->nombre_completo ?: $u->name,
                'email'         => $u->email,
                'cedula'        => $u->cedula,
                'rol'           => $u->getRoleNames()->first(),
                'estado'        => $u->estado,
                'last_login_at' => $u->last_login_at?->toISOString(),
                'last_login_ip' => $u->last_login_ip,
                'created_at'    => $u->created_at?->toISOString(),
                'foto_url'      => $u->foto_url,
            ]);

        $stats = [
            'total'    => $usuarios->count(),
            'admins'   => $usuarios->where('rol', 'admin')->count(),
            'docentes' => $usuarios->where('rol', 'docente')->count(),
        ];

        return Inertia::render('Admin/Permisos/Index', [
            'usuarios' => $usuarios->values(),
            'stats'    => $stats,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombres'   => 'required|string|max:100',
            'apellidos' => 'required|string|max:100',
            'email'     => 'required|email|unique:users,email',
            'cedula'    => 'required|string|max:20|unique:users,cedula',
            'rol'       => 'required|in:admin,docente',
        ]);

        $user = User::create([
            'nombres'   => $request->nombres,
            'apellidos' => $request->apellidos,
            'name'      => trim("{$request->nombres} {$request->apellidos}"),
            'email'     => $request->email,
            'cedula'    => $request->cedula,
            'password'  => Hash::make($request->cedula),
            'role'      => $request->rol,
            'estado'    => 'activo',
        ]);

        $user->assignRole($request->rol);

        return redirect()->back()->with('success', 'Usuario creado. Contraseña inicial: cédula.');
    }

    public function toggleEstado(User $user)
    {
        $nuevoEstado = $user->estado === 'activo' ? 'inactivo' : 'activo';
        $user->update(['estado' => $nuevoEstado]);

        $msg = $nuevoEstado === 'activo' ? 'activado' : 'desactivado';
        return redirect()->back()->with('success', "Usuario {$msg}.");
    }

    public function resetPassword(User $user)
    {
        $user->update([
            'password' => Hash::make($user->cedula ?? 'Password123!'),
        ]);

        return redirect()->back()->with('success', 'Contraseña restablecida a la cédula del usuario.');
    }
}
