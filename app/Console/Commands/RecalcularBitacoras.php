<?php

namespace App\Console\Commands;

use App\Models\BitacoraConfig;
use App\Models\FasePpe;
use Illuminate\Console\Command;

class RecalcularBitacoras extends Command
{
    protected $signature   = 'bitacoras:recalcular';
    protected $description = 'Recalcula numero_global de todas las bitácoras según el orden de cada fase';

    public function handle(): int
    {
        $fases = FasePpe::orderBy('periodo_lectivo_id')
                        ->orderBy('curso_id')
                        ->orderBy('orden')
                        ->get();

        $actualizadas = 0;

        foreach ($fases as $fase) {
            $numeroInicio = ($fase->orden - 1) * 5 + 1;

            $bitacoras = BitacoraConfig::where('fase_ppe_id', $fase->id)
                                       ->orderBy('numero_en_fase')
                                       ->get();

            foreach ($bitacoras as $bitacora) {
                $nuevoGlobal = $numeroInicio + ($bitacora->numero_en_fase - 1);
                $bitacora->update([
                    'numero_global' => $nuevoGlobal,
                    'nombre'        => "Bitácora {$nuevoGlobal}",
                ]);
                $actualizadas++;
            }
        }

        $this->info("Bitácoras recalculadas correctamente: {$actualizadas} registros actualizados.");

        return self::SUCCESS;
    }
}
