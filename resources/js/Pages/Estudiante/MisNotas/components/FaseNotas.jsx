import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import DetalleNotaModal from './DetalleNotaModal';

// ── Helpers ───────────────────────────────────────────────────────────────────

function colorNota(n) {
    const v = parseFloat(n) || 0;
    if (v >= 9) return 'text-green-600 dark:text-green-400';
    if (v >= 7) return 'text-blue-600 dark:text-blue-400';
    if (v >= 5) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
}
function bgColorNota(n) {
    const v = parseFloat(n) || 0;
    if (v >= 9) return 'bg-green-500';
    if (v >= 7) return 'bg-blue-500';
    if (v >= 5) return 'bg-yellow-500';
    return 'bg-red-500';
}
function badgePromedio(n) {
    const v = parseFloat(n) || 0;
    if (v >= 9) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
    if (v >= 7) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
    if (v >= 5) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
    return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
}

const ESTADO_BADGE = {
    calificada:    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    pendiente:     'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    sin_entregar:  'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
};
const ESTADO_LABEL = {
    calificada:    '✅ Calificada',
    pendiente:     '⏳ Por calificar',
    sin_entregar:  '❌ No entregada',
};

// ── Componente ────────────────────────────────────────────────────────────────

export default function FaseNotas({ fase, defaultAbierta = false }) {
    const [abierta, setAbierta]     = useState(defaultAbierta);
    const [modalBit, setModalBit]   = useState(null);

    const { stats } = fase;
    const pct = stats.total > 0
        ? Math.round((stats.calificadas / stats.total) * 100) : 0;

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">

                {/* Header clickeable */}
                <button
                    onClick={() => setAbierta(a => !a)}
                    className="w-full text-left px-5 py-4
                        bg-gray-50 dark:bg-gray-800/80
                        hover:bg-purple-50 dark:hover:bg-purple-900/10
                        transition-colors flex items-start justify-between gap-4">

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-gray-800 dark:text-gray-100 text-sm">
                                Fase {fase.orden}: {fase.nombre}
                            </span>
                            <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                                Bits {fase.rango_bitacoras}
                            </span>
                        </div>

                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {stats.calificadas}/{stats.total} calificadas
                            {stats.pendientes > 0 && ` · ${stats.pendientes} por calificar`}
                            {stats.sin_entregar > 0 && ` · ${stats.sin_entregar} sin entregar`}
                        </p>

                        {/* Barra progreso */}
                        <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700">
                                <div className="h-1.5 rounded-full bg-purple-500 transition-all duration-500"
                                    style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-[11px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
                                {pct}%
                            </span>
                        </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 mt-0.5">
                        {stats.promedio !== null && (
                            <span className={`text-sm font-bold px-3 py-1 rounded-full ${badgePromedio(stats.promedio)}`}>
                                {parseFloat(stats.promedio).toFixed(1)}
                            </span>
                        )}
                        <span className="text-gray-400 dark:text-gray-500">
                            {abierta ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </span>
                    </div>
                </button>

                {/* Contenido desplegable */}
                {abierta && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/60">
                                    <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">N°</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">Bitácora</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 hidden md:table-cell">Actividad</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">Estado</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">Nota</th>
                                    <th className="px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fase.bitacoras.map(bit => (
                                    <tr key={bit.numero_global}
                                        className="border-b border-gray-50 dark:border-gray-700/60
                                            hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">

                                        {/* N° */}
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg
                                                bg-purple-100 dark:bg-purple-900/40
                                                text-purple-700 dark:text-purple-300 text-xs font-bold">
                                                {bit.numero_global}
                                            </span>
                                        </td>

                                        {/* Bitácora */}
                                        <td className="px-4 py-3">
                                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 max-w-[160px] truncate">
                                                {bit.nombre}
                                            </p>
                                        </td>

                                        {/* Actividad */}
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            {bit.actividad_titulo ? (
                                                <p className="text-xs text-gray-600 dark:text-gray-400 max-w-[200px] truncate">
                                                    {bit.actividad_titulo}
                                                </p>
                                            ) : (
                                                <span className="text-xs text-gray-300 dark:text-gray-600 italic">Sin actividad</span>
                                            )}
                                        </td>

                                        {/* Estado */}
                                        <td className="px-4 py-3">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${ESTADO_BADGE[bit.estado]}`}>
                                                {ESTADO_LABEL[bit.estado]}
                                            </span>
                                        </td>

                                        {/* Nota */}
                                        <td className="px-4 py-3">
                                            {bit.calificacion ? (
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xl font-bold leading-none ${colorNota(bit.calificacion.nota)}`}>
                                                        {parseFloat(bit.calificacion.nota).toFixed(1)}
                                                    </span>
                                                    <span className="text-gray-400 dark:text-gray-500 text-xs">/10</span>
                                                    <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 w-16 hidden sm:block">
                                                        <div className={`h-1.5 rounded-full ${bgColorNota(bit.calificacion.nota)}`}
                                                            style={{ width: `${Math.min(100, parseFloat(bit.calificacion.nota) * 10)}%` }} />
                                                    </div>
                                                </div>
                                            ) : bit.estado === 'pendiente' ? (
                                                <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                                                    Esperando...
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
                                            )}
                                        </td>

                                        {/* Acción */}
                                        <td className="px-4 py-3 text-right">
                                            {bit.calificacion ? (
                                                <button onClick={() => setModalBit(bit)}
                                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg
                                                        border border-purple-300 dark:border-purple-700
                                                        text-purple-700 dark:text-purple-300
                                                        hover:bg-purple-50 dark:hover:bg-purple-900/20
                                                        transition-colors whitespace-nowrap">
                                                    👁️ Ver detalle
                                                </button>
                                            ) : (
                                                <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <DetalleNotaModal
                isOpen={!!modalBit}
                onClose={() => setModalBit(null)}
                bitacora={modalBit}
            />
        </>
    );
}
