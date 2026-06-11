<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bitacoras', function (Blueprint $table) {
            $table->id();
            $table->foreignId('estudiante_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('actividad_id')->constrained('actividades_cronograma')->onDelete('cascade');
            $table->string('archivo_path')->nullable();
            $table->text('descripcion')->nullable();
            $table->enum('estado', ['pendiente', 'revisado'])->default('pendiente');
            $table->dateTime('fecha_entrega')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bitacoras');
    }
};
