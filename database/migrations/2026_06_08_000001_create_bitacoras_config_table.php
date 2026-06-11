<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bitacoras_config', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fase_ppe_id')->constrained('fases_ppe')->onDelete('cascade');
            $table->unsignedTinyInteger('numero_en_fase'); // siempre 1 al 5
            $table->integer('numero_global');              // continuo: 1-5 fase1, 6-10 fase2...
            $table->string('nombre');                      // "Bitácora 6", personalizable
            $table->foreignId('actividad_id')->nullable()->constrained('actividades_cronograma')->nullOnDelete();
            $table->enum('estado', ['pendiente', 'activa', 'cerrada'])->default('pendiente');
            $table->text('descripcion')->nullable();
            $table->timestamps();

            $table->unique(['fase_ppe_id', 'numero_en_fase']);
            $table->unique(['fase_ppe_id', 'numero_global']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bitacoras_config');
    }
};
