<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop FK on estudiante_id only if it still exists
        $fks = collect(DB::select("
            SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'estudiante_curso'
              AND CONSTRAINT_TYPE = 'FOREIGN KEY'
              AND CONSTRAINT_NAME = 'estudiante_curso_estudiante_id_foreign'
        "));
        if ($fks->isEmpty()) {
            // Already dropped in a prior partial run — skip
        } else {
            Schema::table('estudiante_curso', fn(Blueprint $t) => $t->dropForeign(['estudiante_id']));
        }

        // Drop old unique only if it still exists
        $oldUnique = collect(DB::select("
            SELECT INDEX_NAME FROM information_schema.STATISTICS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'estudiante_curso'
              AND INDEX_NAME = 'estudiante_curso_estudiante_id_curso_id_unique'
        "));
        if ($oldUnique->isNotEmpty()) {
            Schema::table('estudiante_curso', fn(Blueprint $t) =>
                $t->dropUnique('estudiante_curso_estudiante_id_curso_id_unique')
            );
        }

        // Add new columns only if they don't exist yet
        Schema::table('estudiante_curso', function (Blueprint $table) {
            if (!Schema::hasColumn('estudiante_curso', 'periodo_lectivo_id')) {
                $table->foreignId('periodo_lectivo_id')->nullable()
                    ->constrained('periodos_lectivos')->after('curso_id');
            }
            if (!Schema::hasColumn('estudiante_curso', 'docente_id')) {
                $table->foreignId('docente_id')->nullable()
                    ->constrained('users')->nullOnDelete()->after('periodo_lectivo_id');
            }
            if (!Schema::hasColumn('estudiante_curso', 'fecha_matricula')) {
                $table->date('fecha_matricula')->nullable()->after('docente_id');
            }
            if (!Schema::hasColumn('estudiante_curso', 'estado')) {
                $table->enum('estado', ['activo', 'inactivo', 'retirado'])->default('activo')->after('fecha_matricula');
            }
        });

        // Re-add FK on estudiante_id only if it doesn't exist yet
        $fkExists = collect(DB::select("
            SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'estudiante_curso'
              AND CONSTRAINT_TYPE = 'FOREIGN KEY'
              AND CONSTRAINT_NAME = 'estudiante_curso_estudiante_id_foreign'
        "));
        if ($fkExists->isEmpty()) {
            Schema::table('estudiante_curso', fn(Blueprint $t) =>
                $t->foreign('estudiante_id')->references('id')->on('users')->cascadeOnDelete()
            );
        }

        // Add new unique only if it doesn't exist yet
        $newUnique = collect(DB::select("
            SELECT INDEX_NAME FROM information_schema.STATISTICS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'estudiante_curso'
              AND INDEX_NAME = 'ec_estudiante_curso_periodo_unique'
        "));
        if ($newUnique->isEmpty()) {
            Schema::table('estudiante_curso', fn(Blueprint $t) =>
                $t->unique(['estudiante_id', 'curso_id', 'periodo_lectivo_id'], 'ec_estudiante_curso_periodo_unique')
            );
        }
    }

    public function down(): void
    {
        Schema::table('estudiante_curso', function (Blueprint $table) {
            $table->dropUnique('ec_estudiante_curso_periodo_unique');
            $table->dropForeign(['estudiante_id']);
            $table->dropForeign(['periodo_lectivo_id']);
            $table->dropForeign(['docente_id']);
            $table->dropColumn(['periodo_lectivo_id', 'docente_id', 'fecha_matricula', 'estado']);
            $table->foreign('estudiante_id')->references('id')->on('users')->cascadeOnDelete();
            $table->unique(['estudiante_id', 'curso_id']);
        });
    }
};
