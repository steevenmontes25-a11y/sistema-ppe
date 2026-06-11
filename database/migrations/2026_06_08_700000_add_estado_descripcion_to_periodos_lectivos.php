<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('periodos_lectivos', function (Blueprint $table) {
            if (!Schema::hasColumn('periodos_lectivos', 'estado')) {
                $table->enum('estado', ['planificacion', 'en_curso', 'finalizado', 'archivado'])
                    ->default('planificacion')
                    ->after('activo');
            }
            if (!Schema::hasColumn('periodos_lectivos', 'descripcion')) {
                $table->text('descripcion')->nullable()->after('estado');
            }
        });

        // Actualizar registros existentes para que tengan estado coherente con activo
        \DB::table('periodos_lectivos')
            ->where('activo', true)
            ->whereNotIn('estado', ['en_curso'])
            ->update(['estado' => 'en_curso']);
    }

    public function down(): void
    {
        Schema::table('periodos_lectivos', function (Blueprint $table) {
            $table->dropColumn(['estado', 'descripcion']);
        });
    }
};
