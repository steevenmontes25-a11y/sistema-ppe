<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fases_ppe', function (Blueprint $table) {
            $table->foreignId('curso_id')
                  ->nullable()
                  ->after('periodo_lectivo_id')
                  ->constrained('cursos')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('fases_ppe', function (Blueprint $table) {
            $table->dropForeign(['curso_id']);
            $table->dropColumn('curso_id');
        });
    }
};
