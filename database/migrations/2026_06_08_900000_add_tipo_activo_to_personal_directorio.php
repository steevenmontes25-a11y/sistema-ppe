<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('personal_directorio', function (Blueprint $table) {
            if (!Schema::hasColumn('personal_directorio', 'tipo')) {
                $table->enum('tipo', ['docente', 'administrativo', 'directivo'])
                    ->default('docente')
                    ->after('foto');
            }
            if (!Schema::hasColumn('personal_directorio', 'activo')) {
                $table->boolean('activo')->default(true)->after('tipo');
            }
            // Hacer departamento nullable si no lo es
            $table->string('departamento')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('personal_directorio', function (Blueprint $table) {
            $table->dropColumn(['tipo', 'activo']);
        });
    }
};
