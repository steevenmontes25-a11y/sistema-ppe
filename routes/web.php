<?php

use App\Http\Controllers\Admin\AsistenciaController;
use App\Http\Controllers\Admin\BitacoraAdminController;
use App\Http\Controllers\Admin\CronogramaController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboard;
use App\Http\Controllers\Admin\MatriculacionController;
use App\Http\Controllers\Admin\DirectorioController;
use App\Http\Controllers\Admin\FasePpeController;
use App\Http\Controllers\Admin\PermisosController;
use App\Http\Controllers\Admin\PeriodoLectivoController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Docente\AsistenciaDocenteController;
use App\Http\Controllers\Docente\CalificacionController;
use App\Http\Controllers\Docente\DashboardController as DocenteDashboard;
use App\Http\Controllers\Docente\MisEstudiantesController;
use App\Http\Controllers\Estudiante\CronogramaEstudianteController;
use App\Http\Controllers\Estudiante\DashboardController as EstudianteDashboard;
use App\Http\Controllers\Estudiante\MiAsistenciaController;
use App\Http\Controllers\Estudiante\MisNotasController;
use App\Http\Controllers\PerfilController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

// ── RUTAS DIAGNÓSTICO (temporales, sin autenticación) ───────────────────────
Route::get('/diagnostico', function () {
    return response()->json([
        'periodo_activo'   => \App\Models\PeriodoLectivo::where('activo', true)->first(),
        'total_periodos'   => \App\Models\PeriodoLectivo::count(),
        'total_usuarios'   => \App\Models\User::count(),
        'php_version'      => PHP_VERSION,
        'laravel_version'  => app()->version(),
    ]);
})->middleware('web');

Route::get('/setup-inicial', function () {
    if (\App\Models\User::count() > 0) {
        return response()->json(['mensaje' => 'Ya existen usuarios. Setup omitido.', 'usuarios' => \App\Models\User::count()]);
    }

    \Illuminate\Support\Facades\DB::transaction(function () {
        $roles = ['admin', 'docente', 'estudiante'];
        foreach ($roles as $rol) {
            \Spatie\Permission\Models\Role::firstOrCreate(['name' => $rol, 'guard_name' => 'web']);
        }

        if (\App\Models\PeriodoLectivo::count() === 0) {
            \App\Models\PeriodoLectivo::create([
                'nombre'       => 'Período 2024',
                'fecha_inicio' => '2024-01-01',
                'fecha_fin'    => '2024-12-31',
                'activo'       => true,
            ]);
        }

        $admin = \App\Models\User::create([
            'name'      => 'Administrador',
            'nombres'   => 'Admin',
            'apellidos' => 'Sistema',
            'email'     => 'admin@sistema.com',
            'password'  => \Illuminate\Support\Facades\Hash::make('admin123'),
            'role'      => 'admin',
            'estado'    => 'activo',
        ]);
        $admin->assignRole('admin');
    });

    return response()->json(['mensaje' => 'Setup completado. Admin: admin@sistema.com / admin123']);
})->middleware('web');

// ── RAÍZ: redirige según estado de autenticación ────────────────────────────
Route::get('/', function () {
    if (!Auth::check()) {
        return redirect()->route('login');
    }
    return redirect()->route(Auth::user()->role . '.dashboard');
});

// ── RUTA /dashboard genérica (destino del middleware guest al redirigir) ────
Route::get('/dashboard', function () {
    if (!Auth::check()) {
        return redirect()->route('login');
    }
    return redirect()->route(Auth::user()->role . '.dashboard');
})->middleware('auth')->name('dashboard');

// ── RUTAS PÚBLICAS (solo para no autenticados) ───────────────────────────────
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store'])->name('login.store');
});

// Cerrar sesión (autenticado)
Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');

// ── RUTAS COMPARTIDAS (todos los roles autenticados) ─────────────────────────
Route::middleware('auth')->group(function () {
    Route::get('/perfil',          [PerfilController::class, 'show'])->name('perfil.show');
    Route::put('/perfil',          [PerfilController::class, 'update'])->name('perfil.update');
    Route::post('/perfil/foto',    [PerfilController::class, 'actualizarFoto'])->name('perfil.foto');
    Route::put('/perfil/password', [PerfilController::class, 'cambiarPassword'])->name('perfil.password');
});

// ── RUTAS DE ADMINISTRADOR (COORDINADOR) ────────────────────────────────────
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminDashboard::class, 'index'])->name('dashboard');

    // Matriculación de estudiantes
    Route::get('/matriculacion',                                [MatriculacionController::class, 'index'])->name('matriculacion.index');
    Route::post('/matriculacion',                               [MatriculacionController::class, 'store'])->name('matriculacion.store');
    Route::put('/matriculacion/{estudiante}',                   [MatriculacionController::class, 'update'])->name('matriculacion.update');
    Route::patch('/matriculacion/{estudiante}/baja',            [MatriculacionController::class, 'darDeBaja'])->name('matriculacion.baja');
    Route::patch('/matriculacion/{estudiante}/reactivar',       [MatriculacionController::class, 'reactivar'])->name('matriculacion.reactivar');
    Route::patch('/matriculacion/{estudiante}/reset-password',  [MatriculacionController::class, 'resetPassword'])->name('matriculacion.reset-password');
    Route::delete('/matriculacion/{estudiante}',                [MatriculacionController::class, 'destroy'])->name('matriculacion.destroy');

    // Bitácoras (solo lectura + exportación)
    Route::get('/bitacoras',                          [BitacoraAdminController::class, 'index'])->name('bitacoras.index');
    Route::get('/bitacoras/exportar/excel',           [BitacoraAdminController::class, 'exportarExcel'])->name('bitacoras.exportar.excel');
    Route::get('/bitacoras/exportar/pdf',             [BitacoraAdminController::class, 'exportarPdf'])->name('bitacoras.exportar.pdf');
    Route::get('/bitacoras/{bitacora}/descargar',     [BitacoraAdminController::class, 'descargar'])->name('bitacoras.descargar');

    // Control de Asistencia
    Route::get('/asistencia',                                   [AsistenciaController::class, 'index'])->name('asistencia.index');
    Route::post('/asistencia/corregir-masivo',                  [AsistenciaController::class, 'corregirMasivo'])->name('asistencia.corregir-masivo');
    Route::put('/asistencia/{asistencia}',                      [AsistenciaController::class, 'update'])->name('asistencia.update');

    // Períodos Lectivos
    Route::get('/periodos',                              [PeriodoLectivoController::class, 'index'])->name('periodos.index');
    Route::post('/periodos',                             [PeriodoLectivoController::class, 'store'])->name('periodos.store');
    Route::put('/periodos/{periodo}',                    [PeriodoLectivoController::class, 'update'])->name('periodos.update');
    Route::patch('/periodos/{periodo}/activar',          [PeriodoLectivoController::class, 'activar'])->name('periodos.activar');
    Route::patch('/periodos/{periodo}/desactivar',       [PeriodoLectivoController::class, 'desactivar'])->name('periodos.desactivar');
    Route::delete('/periodos/{periodo}',                 [PeriodoLectivoController::class, 'destroy'])->name('periodos.destroy');

    // Directorio del Personal
    Route::resource('directorio', DirectorioController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    // Permisos y Accesos
    Route::get('/permisos',                              [PermisosController::class, 'index'])->name('permisos.index');
    Route::post('/permisos',                             [PermisosController::class, 'store'])->name('permisos.store');
    Route::patch('/permisos/{user}/toggle',              [PermisosController::class, 'toggleEstado'])->name('permisos.toggle');
    Route::patch('/permisos/{user}/reset-password',      [PermisosController::class, 'resetPassword'])->name('permisos.reset-password');

    // Fases PPE
    Route::get('/fases-ppe',                        [FasePpeController::class, 'index'])->name('fases.index');
    Route::post('/fases-ppe',                       [FasePpeController::class, 'store'])->name('fases.store');
    Route::patch('/fases-ppe/reordenar',            [FasePpeController::class, 'reordenar'])->name('fases.reordenar');
    Route::put('/fases-ppe/{fase}',                 [FasePpeController::class, 'update'])->name('fases.update');
    Route::delete('/fases-ppe/{fase}',              [FasePpeController::class, 'destroy'])->name('fases.destroy');

    // Cronograma de actividades
    Route::get('/cronograma',                                   [CronogramaController::class, 'index'])->name('cronograma.index');
    Route::post('/cronograma',                                  [CronogramaController::class, 'store'])->name('cronograma.store');
    Route::put('/cronograma/bitacora-config/{bitacoraConfig}',  [CronogramaController::class, 'updateBitacoraConfig'])->name('cronograma.bitacora-config.update');
    Route::put('/cronograma/{actividad}',                       [CronogramaController::class, 'update'])->name('cronograma.update');
    Route::delete('/cronograma/{actividad}',                    [CronogramaController::class, 'destroy'])->name('cronograma.destroy');
});

// ── RUTAS DE DOCENTE ─────────────────────────────────────────────────────────
Route::middleware(['auth', 'role:docente'])->prefix('docente')->name('docente.')->group(function () {
    Route::get('/dashboard',       [DocenteDashboard::class,         'index'])->name('dashboard');
    Route::get('/mis-estudiantes', [MisEstudiantesController::class,  'index'])->name('estudiantes.index');
    Route::get('/asistencia',       [AsistenciaDocenteController::class, 'index'])->name('asistencia.index');
    Route::post('/asistencia',      [AsistenciaDocenteController::class, 'registrar'])->name('asistencia.registrar');
    Route::get('/calificaciones',             [CalificacionController::class, 'index'])->name('calificaciones.index');
    Route::post('/calificaciones',            [CalificacionController::class, 'calificar'])->name('calificaciones.calificar');
    Route::post('/calificaciones/no-entrega', [CalificacionController::class, 'calificarNoEntrega'])->name('calificaciones.no-entrega');
});

// ── RUTAS DE ESTUDIANTE ──────────────────────────────────────────────────────
Route::middleware(['auth', 'role:estudiante'])->prefix('estudiante')->name('estudiante.')->group(function () {
    Route::get('/dashboard',              [EstudianteDashboard::class,          'index'])->name('dashboard');
    Route::get('/cronograma',                           [CronogramaEstudianteController::class,'index'])->name('cronograma.index');
    Route::post('/cronograma/entregar',                [CronogramaEstudianteController::class,'entregar'])->name('cronograma.entregar');
    Route::post('/cronograma/actualizar/{bitacora}',   [CronogramaEstudianteController::class,'actualizar'])->name('cronograma.actualizar');
    Route::delete('/cronograma/eliminar/{bitacora}',   [CronogramaEstudianteController::class,'eliminar'])->name('cronograma.eliminar');
    Route::get('/mis-notas',     [MisNotasController::class,    'index'])->name('notas.index');
    Route::get('/mi-asistencia', [MiAsistenciaController::class, 'index'])->name('asistencia.index');
});
