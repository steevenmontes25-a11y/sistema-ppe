<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('actividades_cronograma', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->text('descripcion')->nullable();
            $table->foreignId('fase_ppe_id')->constrained('fases_ppe')->onDelete('cascade');
            $table->foreignId('curso_id')->constrained('cursos')->onDelete('cascade');
            $table->dateTime('fecha_entrega');
            $table->enum('tipo_entrega', ['pdf', 'foto', 'texto'])->default('pdf');
            $table->decimal('puntaje_maximo', 5, 2)->default(10.00);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('actividades_cronograma');
    }
};
