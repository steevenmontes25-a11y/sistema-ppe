<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fases_ppe', function (Blueprint $table) {
            if (!Schema::hasColumn('fases_ppe', 'estado')) {
                $table->enum('estado', ['planificada', 'activa', 'cerrada'])
                    ->default('planificada')
                    ->after('fecha_fin');
            }
        });

        // Marcar fases existentes con orden=1 como activas
        DB::table('fases_ppe')->where('orden', 1)->update(['estado' => 'activa']);
    }

    public function down(): void
    {
        Schema::table('fases_ppe', function (Blueprint $table) {
            $table->dropColumn('estado');
        });
    }
};
