<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('nombres', 100)->nullable()->after('name');
            $table->string('apellidos', 100)->nullable()->after('nombres');
            $table->string('numero_matricula', 20)->unique()->nullable()->after('apellidos');
            $table->enum('sexo', ['masculino', 'femenino', 'otro'])->nullable()->after('cedula');
            $table->string('grado_academico', 100)->nullable()->after('sexo');
            $table->text('direccion')->nullable()->after('grado_academico');
            $table->string('celular', 20)->nullable()->after('direccion');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['nombres', 'apellidos', 'numero_matricula', 'sexo', 'grado_academico', 'direccion', 'celular']);
        });
    }
};
