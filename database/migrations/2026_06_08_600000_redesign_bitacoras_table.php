<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop in reverse FK order, then recreate with new schema
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('calificaciones');
        Schema::dropIfExists('bitacoras');
        Schema::enableForeignKeyConstraints();

        Schema::create('bitacoras', function (Blueprint $table) {
            $table->id();
            $table->foreignId('estudiante_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('bitacora_config_id')->constrained('bitacoras_config')->onDelete('cascade');
            $table->foreignId('curso_id')->constrained('cursos');
            $table->foreignId('periodo_lectivo_id')->constrained('periodos_lectivos');
            $table->string('archivo_path');
            $table->string('archivo_nombre');
            $table->string('archivo_tipo');
            $table->bigInteger('archivo_tamanio')->nullable();
            $table->text('descripcion')->nullable();
            $table->enum('estado', ['entregada', 'revisada', 'devuelta'])->default('entregada');
            $table->timestamp('fecha_entrega');
            $table->timestamps();

            $table->unique(['estudiante_id', 'bitacora_config_id']);
        });

        Schema::create('calificaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bitacora_id')->constrained('bitacoras')->onDelete('cascade');
            $table->foreignId('docente_id')->constrained('users');
            $table->decimal('nota', 4, 2);
            $table->text('justificacion');
            $table->timestamp('fecha_calificacion');
            $table->timestamps();

            $table->unique('bitacora_id');
        });
    }

    public function down(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('calificaciones');
        Schema::dropIfExists('bitacoras');
        Schema::enableForeignKeyConstraints();
    }
};
