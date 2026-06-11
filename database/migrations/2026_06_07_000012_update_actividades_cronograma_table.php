<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('actividades_cronograma', function (Blueprint $table) {
            $table->date('fecha_inicio')->nullable()->after('curso_id');
            $table->date('fecha_finalizacion')->nullable()->after('fecha_entrega');
            $table->enum('estado', ['borrador', 'activa', 'cerrada'])->default('borrador')->after('puntaje_maximo');
        });

        // Agregar 'mixto' al enum tipo_entrega y cambiar fecha_entrega de datetime a date
        DB::statement("ALTER TABLE actividades_cronograma MODIFY COLUMN tipo_entrega ENUM('pdf','foto','texto','mixto') NOT NULL DEFAULT 'pdf'");
        DB::statement("ALTER TABLE actividades_cronograma MODIFY COLUMN fecha_entrega DATE NULL");
    }

    public function down(): void
    {
        Schema::table('actividades_cronograma', function (Blueprint $table) {
            $table->dropColumn(['fecha_inicio', 'fecha_finalizacion', 'estado']);
        });

        DB::statement("ALTER TABLE actividades_cronograma MODIFY COLUMN tipo_entrega ENUM('pdf','foto','texto') NOT NULL DEFAULT 'pdf'");
        DB::statement("ALTER TABLE actividades_cronograma MODIFY COLUMN fecha_entrega DATETIME NULL");
    }
};
