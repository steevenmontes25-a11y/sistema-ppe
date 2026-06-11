<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PersonalDirectorio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DirectorioController extends Controller
{
    public function index()
    {
        $personal = PersonalDirectorio::orderBy('nombre')->get();

        return Inertia::render('Admin/Directorio/Index', [
            'personal' => $personal,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre'       => 'required|string|max:150',
            'cargo'        => 'required|string|max:100',
            'departamento' => 'nullable|string|max:100',
            'email'        => 'nullable|email|max:150',
            'telefono'     => 'nullable|string|max:30',
            'tipo'         => 'required|in:docente,administrativo,directivo',
            'activo'       => 'boolean',
            'foto'         => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('foto')) {
            $data['foto'] = $request->file('foto')->store('directorio', 'public');
        }

        PersonalDirectorio::create($data);

        return redirect()->back()->with('success', 'Miembro del personal agregado.');
    }

    public function update(Request $request, PersonalDirectorio $directorio)
    {
        $data = $request->validate([
            'nombre'       => 'required|string|max:150',
            'cargo'        => 'required|string|max:100',
            'departamento' => 'nullable|string|max:100',
            'email'        => 'nullable|email|max:150',
            'telefono'     => 'nullable|string|max:30',
            'tipo'         => 'required|in:docente,administrativo,directivo',
            'activo'       => 'boolean',
            'foto'         => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('foto')) {
            if ($directorio->foto) {
                Storage::disk('public')->delete($directorio->foto);
            }
            $data['foto'] = $request->file('foto')->store('directorio', 'public');
        } else {
            unset($data['foto']);
        }

        $directorio->update($data);

        return redirect()->back()->with('success', 'Registro actualizado.');
    }

    public function destroy(PersonalDirectorio $directorio)
    {
        if ($directorio->foto) {
            Storage::disk('public')->delete($directorio->foto);
        }
        $directorio->delete();

        return redirect()->back()->with('success', 'Registro eliminado.');
    }
}
