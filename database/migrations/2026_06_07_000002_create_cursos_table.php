<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cursos', function (Blueprint $table) {
            $table->id();
            $table->enum('nombre', ['Primero de Bachillerato', 'Segundo de Bachillerato', 'Tercero de Bachillerato']);
            $table->string('paralelo', 5);
            $table->foreignId('periodo_lectivo_id')->constrained('periodos_lectivos')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cursos');
    }
};
