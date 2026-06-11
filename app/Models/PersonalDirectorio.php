<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PersonalDirectorio extends Model
{
    use HasFactory;

    protected $table = 'personal_directorio';

    protected $fillable = [
        'nombre', 'cargo', 'departamento', 'email', 'telefono', 'foto', 'tipo', 'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];

    protected $appends = ['foto_url'];

    public function getFotoUrlAttribute(): string
    {
        return $this->foto
            ? asset('storage/' . $this->foto)
            : 'https://ui-avatars.com/api/?name=' . urlencode($this->nombre) . '&background=6D28D9&color=ffffff&size=128';
    }
}
