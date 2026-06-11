import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import DetalleNotaModal from './DetalleNotaModal';

// ── Helpers ───────────────────────────────────────────────────────────────────

function normFecha(s) { return s ? String(s).slice(0, 10) : ''; }
function formatFechaCorta(s) {
    if (!s) return '—';
    const d = new Date(s);
    return d.toLocaleDateString('es', { day: '2-digit', month: 'short' });
}

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

const ESTADO_BADGE = {
    calificada:   'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    pendiente:    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    sin_entregar: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
};
const ESTADO_LABEL = {
    calificada:   '✅ Calificada',
    pendiente:    '⏳ Por calificar',
    sin_entregar: '❌ No entregada',
};

const FILA_BG = {
    calificada:   'hover:bg-green-50 dark:hover:bg-green-900/10',
    pendiente:    'hover:bg-yellow-50 dark:hover:bg-yellow-900/10',
    sin_entregar: 'bg-red-50/30 dark:bg-red-900/10',
};

const FILTROS = [
    { key: 'todas',        label: 'Todas' },
    { key: 'calificadas',  label: 'Calificadas' },
    { key: 'pendientes',   label: 'Por calificar' },
    { key: 'sin_entregar', label: 'No entregadas' },
];

// ── Componente ────────────────────────────────────────────────────────────────

export default function VistaLista({ fases }) {
    const [busqueda,     setBusqueda]     = useState('');
    const [filtroEstado, setFiltroEstado] = useState('todas');
    const [modalBit,     setModalBit]     = useState(null);

    const todasBitacoras = useMemo(() =>
        fases.flatMap(fase =>
            fase.bitacoras.map(b => ({
                ...b,
                fase_nombre: fase.nombre,
                fase_orden:  fase.orden,
            }))
        ), [fases]);

    const bitacorasFiltradas = useMemo(() =>
        todasBitacoras
            .filter(b => {
                const matchBusqueda =
                    busqueda === '' ||
                    b.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                    String(b.numero_global).includes(busqueda);
                const matchEstado =
                    filtroEstado === 'todas' ||
                    (filtroEstado === 'calificadas'  && b.estado === 'calificada')    ||
                    (filtroEstado === 'pendientes'   && b.estado === 'pendiente')     ||
                    (filtroEstado === 'sin_entregar' && b.estado === 'sin_entregar');
                return matchBusqueda && matchEstado;
            })
            .sort((a, b) => a.numero_global - b.numero_global),
    [todasBitacoras, busqueda, filtroEstado]);

    // Stats pie de tabla
    const totalEntregadas = todasBitacoras.filter(b => b.entregada).length;
    const notasValidas    = todasBitacoras.filter(b => b.calificacion);
    const promedioGlobal  = notasValidas.length > 0
        ? (notasValidas.reduce((s, b) => s + parseFloat(b.calificacion.nota), 0) / notasValidas.length).toFixed(2)
        : null;

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">

                {/* ── Controles ── */}
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700
                    flex flex-col sm:flex-row items-start sm:items-center gap-3">

                    {/* Búsqueda */}
                    <div className="relative flex-1 min-w-0 w-full sm:max-w-xs">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
                        <input
                            type="text"
                            value={busqueda}
                            onChange={e => setBusqueda(e.target.value)}
                            placeholder="Buscar por nombre o número…"
                            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl
                                border border-gray-200 dark:border-gray-700
                                bg-gray-50 dark:bg-gray-900/50
                                text-gray-800 dark:text-gray-200
                                placeholder:text-gray-400 dark:placeholder:text-gray-600
                                focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                        />
                    </div>

                    {/* Filtros de estado */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {FILTROS.map(f => (
                            <button key={f.key} type="button"
                                onClick={() => setFiltroEstado(f.key)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors
                                    ${filtroEstado === f.key
                                        ? 'bg-purple-600 text-white shadow-sm'
                                        : 'border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-400'
                                    }`}>
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Tabla ── */}
                {bitacorasFiltradas.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-purple-700 text-white">
                                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide">N°</th>
                                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide">Bitácora</th>
                                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide hidden md:table-cell">Actividad</th>
                                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide hidden lg:table-cell">Fase</th>
                                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide hidden sm:table-cell">Entregada</th>
                                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide">Nota</th>
                                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide">Estado</th>
                                    <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wide">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bitacorasFiltradas.map(bit => (
                                    <tr key={bit.numero_global}
                                        className={`border-b border-gray-50 dark:border-gray-700/60 transition-colors ${FILA_BG[bit.estado] ?? ''}`}>

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
                                            <p className={`text-xs font-semibold max-w-[150px] truncate
                                                ${bit.estado === 'sin_entregar'
                                                    ? 'text-gray-400 dark:text-gray-500'
                                                    : 'text-gray-800 dark:text-gray-100'}`}>
                                                {bit.nombre}
                                            </p>
                                        </td>

                                        {/* Actividad */}
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            {bit.actividad_titulo ? (
                                                <p className="text-xs text-gray-600 dark:text-gray-400 max-w-[180px] truncate">
                                                    {bit.actividad_titulo}
                                                </p>
                                            ) : (
                                                <span className="text-xs text-gray-300 dark:text-gray-600 italic">Sin actividad</span>
                                            )}
                                        </td>

                                        {/* Fase */}
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md
                                                    bg-gray-100 dark:bg-gray-700
                                                    text-gray-500 dark:text-gray-400 w-fit">
                                                    Fase {bit.fase_orden}
                                                </span>
                                                <p className="text-[11px] text-gray-500 dark:text-gray-400 max-w-[120px] truncate">
                                                    {bit.fase_nombre}
                                                </p>
                                            </div>
                                        </td>

                                        {/* Entregada */}
                                        <td className="px-4 py-3 hidden sm:table-cell">
                                            {bit.fecha_entregada ? (
                                                <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                    {formatFechaCorta(bit.fecha_entregada)}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
                                            )}
                                        </td>

                                        {/* Nota */}
                                        <td className="px-4 py-3">
                                            {bit.calificacion ? (
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-lg font-bold leading-none ${colorNota(bit.calificacion.nota)}`}>
                                                        {parseFloat(bit.calificacion.nota).toFixed(1)}
                                                    </span>
                                                    <span className="text-xs text-gray-400 dark:text-gray-500">/10</span>
                                                    <div className="w-12 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 hidden sm:block">
                                                        <div className={`h-1.5 rounded-full ${bgColorNota(bit.calificacion.nota)}`}
                                                            style={{ width: `${Math.min(100, parseFloat(bit.calificacion.nota) * 10)}%` }} />
                                                    </div>
                                                </div>
                                            ) : bit.estado === 'pendiente' ? (
                                                <span className="text-xs italic text-yellow-500 dark:text-yellow-400">
                                                    Por calificar
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                                            )}
                                        </td>

                                        {/* Estado */}
                                        <td className="px-4 py-3">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${ESTADO_BADGE[bit.estado]}`}>
                                                {ESTADO_LABEL[bit.estado]}
                                            </span>
                                        </td>

                                        {/* Acción */}
                                        <td className="px-4 py-3 text-right">
                                            {bit.calificacion ? (
                                                <button onClick={() => setModalBit(bit)}
                                                    title="Ver detalle de calificación"
                                                    className="px-2.5 py-1.5 text-xs font-semibold rounded-lg
                                                        border border-purple-300 dark:border-purple-700
                                                        text-purple-700 dark:text-purple-300
                                                        hover:bg-purple-50 dark:hover:bg-purple-900/20
                                                        transition-colors">
                                                    👁️
                                                </button>
                                            ) : (
                                                <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                            {/* Pie de tabla — totales */}
                            <tfoot>
                                <tr className="bg-purple-50 dark:bg-purple-900/20 border-t-2 border-purple-200 dark:border-purple-700">
                                    <td className="px-4 py-3" colSpan={2}>
                                        <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                                            {todasBitacoras.length} bitácoras en total
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell" />
                                    <td className="px-4 py-3 hidden lg:table-cell" />
                                    <td className="px-4 py-3 hidden sm:table-cell">
                                        <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                                            {totalEntregadas} entregadas
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {promedioGlobal !== null ? (
                                            <span className={`text-sm font-bold ${colorNota(promedioGlobal)}`}>
                                                {parseFloat(promedioGlobal).toFixed(2)}/10
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3" colSpan={2}>
                                        <span className="text-[11px] text-purple-500 dark:text-purple-400">
                                            {notasValidas.length} calificadas
                                        </span>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>

                        {/* Texto debajo */}
                        <p className="px-4 py-2.5 text-[11px] text-gray-400 dark:text-gray-500 border-t border-gray-50 dark:border-gray-700/60">
                            Mostrando {bitacorasFiltradas.length} de {todasBitacoras.length} bitácoras
                        </p>
                    </div>
                ) : (
                    /* Sin resultados */
                    <div className="text-center py-12 px-4">
                        <Search size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                            No se encontraron bitácoras
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Intenta ajustar los filtros o la búsqueda
                        </p>
                        <button
                            onClick={() => { setBusqueda(''); setFiltroEstado('todas'); }}
                            className="mt-3 text-purple-600 dark:text-purple-400 text-sm hover:underline transition-colors">
                            Limpiar filtros
                        </button>
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
