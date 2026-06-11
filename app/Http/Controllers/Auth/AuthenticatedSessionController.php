<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    // Muestra el formulario de login
    public function create(): Response
    {
        return Inertia::render('Auth/Login');
    }

    // Procesa el intento de login
    public function store(Request $request)
    {
        $credentials = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($credentials, $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => 'Las credenciales no coinciden con nuestros registros.',
            ]);
        }

        $user = Auth::user();

        // Verificar que el usuario esté activo
        if ($user->estado !== 'activo') {
            Auth::logout();
            throw ValidationException::withMessages([
                'email' => 'Tu cuenta está desactivada. Contacta al coordinador.',
            ]);
        }

        $request->session()->regenerate();

        // Registrar último acceso
        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ]);

        // Redirigir según el rol
        return redirect()->intended($this->dashboardPorRol($user->role));
    }

    // Cierra la sesión del usuario
    public function destroy(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('login');
    }

    private function dashboardPorRol(string $role): string
    {
        return match ($role) {
            'admin'      => route('admin.dashboard'),
            'docente'    => route('docente.dashboard'),
            'estudiante' => route('estudiante.dashboard'),
            default      => route('login'),
        };
    }
}
