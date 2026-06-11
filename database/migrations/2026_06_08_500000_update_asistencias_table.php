<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Eliminar duplicados antes de agregar restricción única
        DB::statement("
            DELETE a1 FROM asistencias a1
            INNER JOIN asistencias a2
            WHERE a1.id > a2.id
              AND a1.estudiante_id = a2.estudiante_id
              AND a1.curso_id      = a2.curso_id
              AND a1.fecha         = a2.fecha
        ");

        Schema::table('asistencias', function (Blueprint $table) {
            if (!Schema::hasColumn('asistencias', 'periodo_lectivo_id')) {
                $table->foreignId('periodo_lectivo_id')
                    ->nullable()
                    ->constrained('periodos_lectivos')
                    ->after('curso_id');
            }
            if (!Schema::hasColumn('asistencias', 'corregido_por')) {
                $table->foreignId('corregido_por')
                    ->nullable()
                    ->constrained('users')
                    ->nullOnDelete()
                    ->after('registrado_por');
            }
            if (!Schema::hasColumn('asistencias', 'corregido_at')) {
                $table->timestamp('corregido_at')
                    ->nullable()
                    ->after('corregido_por');
            }
        });

        $uniqueExists = collect(DB::select("
            SELECT INDEX_NAME FROM information_schema.STATISTICS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME   = 'asistencias'
              AND INDEX_NAME   = 'asistencias_est_cur_fecha_unique'
        "))->isNotEmpty();

        if (!$uniqueExists) {
            Schema::table('asistencias', function (Blueprint $table) {
                $table->unique(
                    ['estudiante_id', 'curso_id', 'fecha'],
                    'asistencias_est_cur_fecha_unique'
                );
            });
        }
    }

    public function down(): void
    {
        Schema::table('asistencias', function (Blueprint $table) {
            $table->dropUnique('asistencias_est_cur_fecha_unique');
            $table->dropForeign(['corregido_por']);
            $table->dropForeign(['periodo_lectivo_id']);
            $table->dropColumn(['periodo_lectivo_id', 'corregido_por', 'corregido_at']);
        });
    }
};
