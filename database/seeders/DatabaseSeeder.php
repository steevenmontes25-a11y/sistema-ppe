<?php

namespace Database\Seeders;

use App\Models\ActividadCronograma;
use App\Models\Asistencia;
use App\Models\Bitacora;
use App\Models\BitacoraConfig;
use App\Models\Calificacion;
use App\Models\Curso;
use App\Models\FasePpe;
use App\Models\PeriodoLectivo;
use App\Models\PersonalDirectorio;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── LIMPIEZA COMPLETA (permite re-ejecutar el seeder) ────────────────
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        DB::table('calificaciones')->truncate();
        DB::table('bitacoras')->truncate();
        DB::table('bitacoras_config')->truncate();
        DB::table('asistencias')->truncate();
        DB::table('actividades_cronograma')->truncate();
        DB::table('fases_ppe')->truncate();
        DB::table('personal_directorio')->truncate();
        DB::table('estudiante_curso')->truncate();
        DB::table('docente_curso')->truncate();
        DB::table('cursos')->truncate();
        DB::table('periodos_lectivos')->truncate();
        DB::table('model_has_roles')->truncate();
        DB::table('model_has_permissions')->truncate();
        DB::table('role_has_permissions')->truncate();
        DB::table('roles')->truncate();
        DB::table('permissions')->truncate();
        DB::table('users')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        // ── ROLES ─────────────────────────────────────────────────────────────
        $roleAdmin      = Role::create(['name' => 'admin',      'guard_name' => 'web']);
        $roleDocente    = Role::create(['name' => 'docente',    'guard_name' => 'web']);
        $roleEstudiante = Role::create(['name' => 'estudiante', 'guard_name' => 'web']);

        // ── COORDINADOR ───────────────────────────────────────────────────────
        $admin = User::create([
            'name'     => 'Coordinador PPE',
            'email'    => 'coordinador@ppe.edu',
            'password' => Hash::make('Admin123!'),
            'role'     => 'admin',
            'cedula'   => '1700000001',
            'telefono' => '0991234567',
            'estado'   => 'activo',
        ]);
        $admin->assignRole($roleAdmin);

        // ── DOCENTES ──────────────────────────────────────────────────────────
        $docente1 = User::create([
            'name'     => 'Prof. María González',
            'email'    => 'mgonzalez@ppe.edu',
            'password' => Hash::make('Docente123!'),
            'role'     => 'docente',
            'cedula'   => '1700000002',
            'telefono' => '0987654321',
            'estado'   => 'activo',
        ]);
        $docente1->assignRole($roleDocente);

        $docente2 = User::create([
            'name'     => 'Prof. Carlos Ramírez',
            'email'    => 'cramirez@ppe.edu',
            'password' => Hash::make('Docente123!'),
            'role'     => 'docente',
            'cedula'   => '1700000003',
            'telefono' => '0976543210',
            'estado'   => 'activo',
        ]);
        $docente2->assignRole($roleDocente);

        // ── PERÍODOS LECTIVOS ─────────────────────────────────────────────────
        PeriodoLectivo::create([
            'nombre'       => '2024-2025',
            'fecha_inicio' => '2024-09-01',
            'fecha_fin'    => '2025-06-30',
            'activo'       => false,
            'estado'       => 'finalizado',
            'descripcion'  => 'Primer período del sistema PPE. Año académico 2024-2025.',
        ]);

        $periodo = PeriodoLectivo::create([
            'nombre'       => '2025-2026',
            'fecha_inicio' => '2025-09-01',
            'fecha_fin'    => '2026-06-30',
            'activo'       => true,
            'estado'       => 'en_curso',
            'descripcion'  => 'Período lectivo actual. Sistema de Participación Estudiantil.',
        ]);

        // ── CURSOS ────────────────────────────────────────────────────────────
        $curso1 = Curso::create(['nombre' => 'Primero de Bachillerato',  'paralelo' => 'A', 'periodo_lectivo_id' => $periodo->id]);
        $curso2 = Curso::create(['nombre' => 'Segundo de Bachillerato',  'paralelo' => 'A', 'periodo_lectivo_id' => $periodo->id]);
        $curso3 = Curso::create(['nombre' => 'Tercero de Bachillerato',  'paralelo' => 'A', 'periodo_lectivo_id' => $periodo->id]);

        $docente1->cursosDocente()->attach([$curso1->id, $curso2->id]);
        $docente2->cursosDocente()->attach([$curso3->id]);

        // ── FASES PPE (3 fases × 3 cursos = 9 fases) ─────────────────────────
        $definicionFases = [
            ['nombre' => 'Fase 1: Diagnóstico', 'descripcion' => 'Diagnóstico y planificación de actividades PPE.',    'orden' => 1, 'fecha_inicio' => '2025-09-01', 'fecha_fin' => '2025-11-30', 'estado' => 'activa'],
            ['nombre' => 'Fase 2: Ejecución',   'descripcion' => 'Desarrollo y ejecución de proyectos estudiantiles.', 'orden' => 2, 'fecha_inicio' => '2025-12-01', 'fecha_fin' => '2026-03-31', 'estado' => 'planificada'],
            ['nombre' => 'Fase 3: Evaluación',  'descripcion' => 'Evaluación y presentación de resultados PPE.',       'orden' => 3, 'fecha_inicio' => '2026-04-01', 'fecha_fin' => '2026-06-30', 'estado' => 'planificada'],
        ];

        $fasesPorCurso = [];
        foreach ([$curso1, $curso2, $curso3] as $curso) {
            foreach ($definicionFases as $def) {
                $fase = FasePpe::create([
                    ...$def,
                    'curso_id'           => $curso->id,
                    'periodo_lectivo_id' => $periodo->id,
                ]);
                $fasesPorCurso[$curso->id][] = $fase;
            }
        }

        // ── ACTIVIDADES (2 por fase, variando tipos y estados) ────────────────
        $tipos   = ['pdf', 'foto', 'texto', 'mixto', 'pdf', 'foto'];
        $estados = ['activa', 'borrador', 'activa', 'cerrada', 'activa', 'borrador'];

        $actividadesPrimera = []; // para bitácoras: guardamos la primera actividad de cada curso

        foreach ([$curso1, $curso2, $curso3] as $i => $curso) {
            $fases   = $fasesPorCurso[$curso->id];
            $tipoIdx = 0;

            foreach ($fases as $faseIdx => $fase) {
                for ($n = 1; $n <= 2; $n++) {
                    // Distribuir fechas en el mes actual y siguiente para que se vean en el calendario
                    $baseOffset   = ($i * 2) + ($faseIdx * 4) + ($n - 1) * 2;
                    $fechaInicio  = now()->startOfMonth()->addDays($baseOffset);
                    $fechaEntrega = $fechaInicio->copy()->addDays(7);
                    $fechaCierre  = $fechaEntrega->copy()->addDays(5);

                    $act = ActividadCronograma::create([
                        'titulo'             => "Actividad {$n}: " . $this->tituloActividad($faseIdx, $n),
                        'descripcion'        => $this->descripcionActividad($faseIdx, $n),
                        'fase_ppe_id'        => $fase->id,
                        'curso_id'           => $curso->id,
                        'fecha_inicio'       => $fechaInicio->toDateString(),
                        'fecha_entrega'      => $fechaEntrega->toDateString(),
                        'fecha_finalizacion' => $fechaCierre->toDateString(),
                        'tipo_entrega'       => $tipos[$tipoIdx % 6],
                        'puntaje_maximo'     => ($n === 1) ? 10.00 : 8.00,
                        'estado'             => $estados[$tipoIdx % 6],
                    ]);

                    // Guardar la primera actividad de cada curso para las bitácoras
                    if ($faseIdx === 0 && $n === 1) {
                        $actividadesPrimera[$curso->id] = $act;
                    }
                    $tipoIdx++;
                }
            }
        }

        // ── BITÁCORAS CONFIG (5 por fase, numeración global continua por orden de fase) ─
        foreach ([$curso1, $curso2, $curso3] as $curso) {
            foreach ($fasesPorCurso[$curso->id] as $fase) {
                $numeroInicio = ($fase->orden - 1) * 5 + 1;
                $actsEnFase   = ActividadCronograma::where('fase_ppe_id', $fase->id)
                    ->orderBy('id')
                    ->pluck('id')
                    ->toArray();

                for ($i = 1; $i <= 5; $i++) {
                    $numeroGlobal = $numeroInicio + ($i - 1);
                    BitacoraConfig::create([
                        'fase_ppe_id'    => $fase->id,
                        'numero_en_fase' => $i,
                        'numero_global'  => $numeroGlobal,
                        'nombre'         => "Bitácora {$numeroGlobal}",
                        'actividad_id'   => $actsEnFase[$i - 1] ?? null,
                        'estado'         => $i <= 2 ? 'activa' : 'pendiente',
                    ]);
                }
            }
        }

        // ── ESTUDIANTES (9 estudiantes: 3 por curso) ─────────────────────────
        // Contraseña de cada estudiante = su cédula
        $estudiantesData = [
            // Primero de Bachillerato (docente1)
            ['nombres' => 'Ana Lucía',    'apellidos' => 'Torres Medina',   'cedula' => '1712345678', 'email' => 'ana.torres@estudiante.ppe.edu',     'sexo' => 'femenino',  'grado_academico' => 'Primero de Bachillerato',  'celular' => '0991234501', 'curso' => $curso1, 'docente' => $docente1],
            ['nombres' => 'Diego',        'apellidos' => 'Ruiz Espinoza',   'cedula' => '1723456789', 'email' => 'diego.ruiz@estudiante.ppe.edu',      'sexo' => 'masculino', 'grado_academico' => 'Primero de Bachillerato',  'celular' => '0992345602', 'curso' => $curso1, 'docente' => $docente1],
            ['nombres' => 'Camila',       'apellidos' => 'Herrera Lagos',   'cedula' => '1734567890', 'email' => 'camila.herrera@estudiante.ppe.edu',  'sexo' => 'femenino',  'grado_academico' => 'Primero de Bachillerato',  'celular' => '0993456703', 'curso' => $curso1, 'docente' => $docente1],
            // Segundo de Bachillerato (docente1)
            ['nombres' => 'Valeria',      'apellidos' => 'Salcedo Vera',    'cedula' => '1745678901', 'email' => 'valeria.salcedo@estudiante.ppe.edu', 'sexo' => 'femenino',  'grado_academico' => 'Segundo de Bachillerato', 'celular' => '0994567804', 'curso' => $curso2, 'docente' => $docente1],
            ['nombres' => 'Mateo',        'apellidos' => 'Córdoba Ortiz',   'cedula' => '1756789012', 'email' => 'mateo.cordoba@estudiante.ppe.edu',   'sexo' => 'masculino', 'grado_academico' => 'Segundo de Bachillerato', 'celular' => '0995678905', 'curso' => $curso2, 'docente' => $docente1],
            ['nombres' => 'Sofía',        'apellidos' => 'Pacheco Ramos',   'cedula' => '1767890123', 'email' => 'sofia.pacheco@estudiante.ppe.edu',   'sexo' => 'femenino',  'grado_academico' => 'Segundo de Bachillerato', 'celular' => '0996789006', 'curso' => $curso2, 'docente' => $docente1],
            // Tercero de Bachillerato (docente2)
            ['nombres' => 'Gabriela',     'apellidos' => 'Mendoza Soto',    'cedula' => '1778901234', 'email' => 'gabriela.mendoza@estudiante.ppe.edu','sexo' => 'femenino',  'grado_academico' => 'Tercero de Bachillerato', 'celular' => '0997890107', 'curso' => $curso3, 'docente' => $docente2],
            ['nombres' => 'Sebastián',    'apellidos' => 'Flores Cárdenas', 'cedula' => '1789012345', 'email' => 'sebastian.flores@estudiante.ppe.edu','sexo' => 'masculino', 'grado_academico' => 'Tercero de Bachillerato', 'celular' => '0998901208', 'curso' => $curso3, 'docente' => $docente2],
            ['nombres' => 'Nicolás',      'apellidos' => 'Vargas Pinto',    'cedula' => '1790123456', 'email' => 'nicolas.vargas@estudiante.ppe.edu',  'sexo' => 'masculino', 'grado_academico' => 'Tercero de Bachillerato', 'celular' => '0999012309', 'curso' => $curso3, 'docente' => $docente2],
        ];

        $year          = now()->year;
        $matriculaSeq  = 1;

        foreach ($estudiantesData as $data) {
            $cursoEstudiante   = $data['curso'];
            $docenteAsignado   = $data['docente'];
            unset($data['curso'], $data['docente']);

            $numeroMatricula = "PPE-{$year}-" . str_pad($matriculaSeq++, 3, '0', STR_PAD_LEFT);

            $estudiante = User::create([
                'name'             => trim("{$data['nombres']} {$data['apellidos']}"),
                'nombres'          => $data['nombres'],
                'apellidos'        => $data['apellidos'],
                'numero_matricula' => $numeroMatricula,
                'cedula'           => $data['cedula'],
                'email'            => $data['email'],
                'sexo'             => $data['sexo'],
                'grado_academico'  => $data['grado_academico'],
                'celular'          => $data['celular'],
                'password'         => Hash::make($data['cedula']),
                'role'             => 'estudiante',
                'estado'           => 'activo',
            ]);
            $estudiante->assignRole($roleEstudiante);

            $estudiante->cursos()->attach($cursoEstudiante->id, [
                'periodo_lectivo_id' => $periodo->id,
                'docente_id'         => $docenteAsignado->id,
                'fecha_matricula'    => now()->toDateString(),
                'estado'             => 'activo',
            ]);

        }

        // ── ASISTENCIAS (10 días hábiles por estudiante) ─────────────────────
        $todosEstudiantes = User::role('estudiante')->get();

        $fechasHabiles = collect();
        $fechaIter     = now();
        while ($fechasHabiles->count() < 10) {
            if (!in_array($fechaIter->dayOfWeek, [0, 6])) {
                $fechasHabiles->push($fechaIter->copy()->format('Y-m-d'));
            }
            $fechaIter->subDay();
        }

        foreach ($todosEstudiantes as $est) {
            $matricula = DB::table('estudiante_curso')
                ->where('estudiante_id', $est->id)
                ->first();
            if (!$matricula) continue;

            foreach ($fechasHabiles as $fechaStr) {
                $estado = fake()->randomElement([
                    'presente', 'presente', 'presente', 'presente', 'presente',
                    'presente', 'presente', 'presente',
                    'ausente', 'tardanza', 'justificado',
                ]);
                Asistencia::firstOrCreate(
                    [
                        'estudiante_id' => $est->id,
                        'curso_id'      => $matricula->curso_id,
                        'fecha'         => $fechaStr,
                    ],
                    [
                        'periodo_lectivo_id' => $matricula->periodo_lectivo_id ?? $periodo->id,
                        'registrado_por'     => $matricula->docente_id,
                        'estado'             => $estado,
                        'observacion'        => $estado === 'justificado'
                            ? 'Presentó justificación médica' : null,
                    ]
                );
            }
        }

        // ── BITÁCORAS (80% entrega, 70% calificación, primeras 3 configs por curso) ─
        Storage::disk('public')->put(
            'bitacoras/demo/sample.pdf',
            "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF"
        );

        $estadosBit = ['entregada', 'revisada', 'devuelta'];
        $notas      = [5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0];

        foreach ([$curso1, $curso2, $curso3] as $curso) {
            $docenteCurso = $curso->docentes()->first();

            // Primeras 3 configs activas del curso (agrupadas por las primeras 3 fases)
            $configs = BitacoraConfig::whereHas('fase', fn($q) => $q->where('curso_id', $curso->id))
                ->orderBy('numero_global')
                ->take(3)
                ->get();

            $estudiantes = User::role('estudiante')
                ->whereHas('cursos', fn($q) => $q->where('cursos.id', $curso->id))
                ->get();

            foreach ($estudiantes as $est) {
                foreach ($configs as $config) {
                    // 80% submission rate
                    if (fake()->boolean(80)) {
                        $estado     = fake()->randomElement($estadosBit);
                        $diasOffset = fake()->numberBetween(1, 14);
                        $bitacora = Bitacora::create([
                            'estudiante_id'     => $est->id,
                            'bitacora_config_id' => $config->id,
                            'curso_id'          => $curso->id,
                            'periodo_lectivo_id' => $periodo->id,
                            'descripcion'       => fake()->sentence(10),
                            'estado'            => $estado,
                            'fecha_entrega'     => now()->subDays($diasOffset)->toDateString(),
                            'archivo_nombre'    => "bitacora_{$config->numero_global}_{$est->id}.pdf",
                            'archivo_tipo'      => 'pdf',
                            'archivo_tamanio'   => fake()->numberBetween(50000, 500000),
                            'archivo_path'      => 'bitacoras/demo/sample.pdf',
                        ]);

                        // 70% calificación rate
                        if (fake()->boolean(70) && $docenteCurso) {
                            Calificacion::create([
                                'bitacora_id'        => $bitacora->id,
                                'docente_id'         => $docenteCurso->id,
                                'nota'               => fake()->randomElement($notas),
                                'justificacion'      => fake()->boolean(40) ? fake()->sentence(8) : '',
                                'fecha_calificacion' => now()->subDays(fake()->numberBetween(0, $diasOffset - 1))->toDateString(),
                            ]);
                        }
                    }
                }
            }
        }

        // ── DIRECTORIO DEL PERSONAL ───────────────────────────────────────────
        $directorio = [
            // Directivos
            ['nombre' => 'Lic. Roberto Vega',     'cargo' => 'Rector',            'departamento' => 'Rectorado',      'email' => 'rector@ppe.edu',        'telefono' => '022345678', 'tipo' => 'directivo',      'activo' => true],
            ['nombre' => 'Mgs. Patricia Suárez',  'cargo' => 'Vicerrectora',      'departamento' => 'Vicerrectorado', 'email' => 'vicerrectora@ppe.edu',  'telefono' => '022345679', 'tipo' => 'directivo',      'activo' => true],
            // Administrativos
            ['nombre' => 'Lic. Jorge Mendoza',    'cargo' => 'Inspector General', 'departamento' => 'Inspección',     'email' => 'inspector@ppe.edu',     'telefono' => '022345680', 'tipo' => 'administrativo', 'activo' => true],
            ['nombre' => 'Ing. Marco Herrera',    'cargo' => 'Secretario',        'departamento' => 'Secretaría',     'email' => 'secretaria@ppe.edu',    'telefono' => '022345682', 'tipo' => 'administrativo', 'activo' => true],
            // Docentes
            ['nombre' => 'Prof. María González',  'cargo' => 'Docente PPE',       'departamento' => 'Docencia',       'email' => 'mgonzalez@ppe.edu',     'telefono' => '0987654321','tipo' => 'docente',        'activo' => true],
            ['nombre' => 'Prof. Carlos Ramírez',  'cargo' => 'Docente PPE',       'departamento' => 'Docencia',       'email' => 'cramirez@ppe.edu',      'telefono' => '0976543210','tipo' => 'docente',        'activo' => true],
        ];
        foreach ($directorio as $persona) {
            PersonalDirectorio::create($persona);
        }
    }

    private function tituloActividad(int $fase, int $n): string
    {
        $titulos = [
            0 => ['Diagnóstico Comunitario', 'Análisis de Necesidades'],
            1 => ['Planificación del Proyecto', 'Diseño de Estrategias'],
            2 => ['Presentación de Resultados', 'Informe Final de Evaluación'],
        ];
        return $titulos[$fase][$n - 1] ?? "Tarea {$n}";
    }

    private function descripcionActividad(int $fase, int $n): string
    {
        $descs = [
            0 => [
                'Realizar un diagnóstico de las necesidades de la comunidad utilizando encuestas y observación directa.',
                'Analizar los datos recopilados e identificar las problemáticas prioritarias del entorno.',
            ],
            1 => [
                'Elaborar el plan de trabajo detallado con objetivos, actividades y cronograma de ejecución.',
                'Definir las estrategias de intervención y los recursos necesarios para el proyecto.',
            ],
            2 => [
                'Presentar los resultados del proyecto ante la comunidad educativa con evidencias documentadas.',
                'Redactar el informe final de evaluación con conclusiones y recomendaciones para futuros proyectos.',
            ],
        ];
        return $descs[$fase][$n - 1] ?? '';
    }
}
