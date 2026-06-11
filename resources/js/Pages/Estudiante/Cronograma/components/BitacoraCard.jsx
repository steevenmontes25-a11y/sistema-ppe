// ── Helpers ───────────────────────────────────────────────────────────────────

function normFecha(s) { return s ? String(s).slice(0, 10) : ''; }
function formatFecha(s) {
    if (!s) return '—';
    const [y, m, d] = normFecha(s).split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
}

function puedeEditar(entrega, actividad) {
    if (!entrega) return false;
    if (entrega.calificacion) return false;
    if (!actividad?.fecha_finalizacion) return true;
    const fin = new Date(normFecha(actividad.fecha_finalizacion) + 'T23:59:59');
    return fin > new Date();
}

// ── Constantes módulo ─────────────────────────────────────────────────────────

const BORDER_COLOR = {
    pendiente: 'border-gray-300 dark:border-gray-600',
    entregada: 'border-blue-400 dark:border-blue-500',
    calificada:'border-green-500 dark:border-green-400',
    vencida:   'border-red-500 dark:border-red-400',
};

const ESTADO_BADGE = {
    pendiente: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
    entregada: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    calificada:'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
    vencida:   'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
};

const ESTADO_LABEL = {
    pendiente: 'Pendiente',
    entregada: 'Entregada',
    calificada:'Calificada',
    vencida:   'Vencida',
};

const NOTA_COLOR = {
    green:  'text-green-600 dark:text-green-400',
    blue:   'text-blue-600 dark:text-blue-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    red:    'text-red-600 dark:text-red-400',
};

function notaColorKey(nota) {
    const n = parseFloat(nota) || 0;
    if (n >= 9) return 'green';
    if (n >= 7) return 'blue';
    if (n >= 5) return 'yellow';
    return 'red';
}

function DiasBadge({ dias, estado }) {
    if (estado === 'entregada' || estado === 'calificada') return null;
    if (estado === 'vencida' || dias === null)
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">Vencida</span>;
    if (dias === 0)
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">¡Hoy!</span>;
    if (dias <= 2)
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">¡{dias} días!</span>;
    if (dias <= 7)
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300">{dias} días</span>;
    return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">{dias} días</span>;
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function BitacoraCard({ bitacora, onEntregar, onDetalle, onEditar, onEliminar }) {
    const { numero_global, nombre, estado, dias_restantes, actividad, entrega } = bitacora;
    const nota       = entrega?.calificacion?.nota;
    const colorKey   = nota ? notaColorKey(nota) : 'red';
    const notaPct    = nota ? Math.round((parseFloat(nota) / 10) * 100) : 0;
    const barColor   = { green: '#16a34a', blue: '#2563eb', yellow: '#d97706', red: '#dc2626' };
    const puedeEdit  = puedeEditar(entrega, actividad);

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700
            border-t-4 ${BORDER_COLOR[estado] ?? ''} shadow-sm
            ${estado === 'vencida' ? 'opacity-75' : ''}
            flex flex-col`}>

            {/* Header */}
            <div className="p-4 pb-3 border-b border-gray-100 dark:border-gray-700/60">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="shrink-0 inline-flex items-center justify-center
                            w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/40
                            text-purple-700 dark:text-purple-300 text-xs font-bold">
                            {numero_global}
                        </span>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-tight truncate">
                            {nombre}
                        </p>
                    </div>
                    <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${ESTADO_BADGE[estado]}`}>
                        {estado === 'calificada' && nota
                            ? `★ ${parseFloat(nota).toFixed(1)}`
                            : ESTADO_LABEL[estado]}
                    </span>
                </div>
            </div>

            {/* Actividad */}
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700/60 flex-1">
                {actividad ? (
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-medium line-clamp-2">
                        📋 {actividad.titulo}
                    </p>
                ) : (
                    <p className="text-xs text-gray-400 dark:text-gray-500 italic">Sin actividad asignada</p>
                )}
            </div>

            {/* Fecha */}
            {actividad?.fecha_entrega && (
                <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700/60
                    flex items-center justify-between gap-2">
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        📅 {formatFecha(actividad.fecha_entrega)}
                    </p>
                    <DiasBadge dias={dias_restantes} estado={estado} />
                </div>
            )}

            {/* Nota barra */}
            {estado === 'calificada' && nota && (
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700/60">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                            Nota
                        </span>
                        <span className={`text-base font-bold ${NOTA_COLOR[colorKey]}`}>
                            {parseFloat(nota).toFixed(1)}<span className="text-xs font-normal text-gray-400">/10</span>
                        </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-700">
                        <div className="h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${notaPct}%`, backgroundColor: barColor[colorKey] }} />
                    </div>
                </div>
            )}

            {/* Acción */}
            <div className="p-3">
                {estado === 'pendiente' && actividad && (
                    <button onClick={() => onEntregar(bitacora)}
                        className="w-full py-2 text-xs font-semibold rounded-lg
                            bg-purple-600 hover:bg-purple-700 text-white transition-colors">
                        📤 Entregar Bitácora
                    </button>
                )}
                {estado === 'pendiente' && !actividad && (
                    <p className="text-center text-xs text-gray-400 dark:text-gray-500 italic py-1">
                        Sin actividad asignada
                    </p>
                )}

                {/* Entregada + puede editar: 3 botones */}
                {estado === 'entregada' && puedeEdit && (
                    <div className="flex gap-1.5">
                        <button onClick={() => onDetalle(bitacora)}
                            className="flex-1 py-2 text-xs font-semibold rounded-lg
                                border border-purple-300 dark:border-purple-700
                                text-purple-700 dark:text-purple-300
                                hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                            👁️ Ver
                        </button>
                        <button onClick={() => onEditar?.(bitacora)}
                            title="Editar entrega"
                            className="px-3 py-2 text-xs rounded-lg
                                border border-blue-300 dark:border-blue-700
                                text-blue-700 dark:text-blue-300
                                hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                            ✏️
                        </button>
                        <button onClick={() => onEliminar?.(bitacora)}
                            title="Eliminar entrega"
                            className="px-3 py-2 text-xs rounded-lg
                                border border-red-300 dark:border-red-700
                                text-red-600 dark:text-red-400
                                hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                            🗑️
                        </button>
                    </div>
                )}

                {/* Entregada sin posibilidad de editar / calificada */}
                {(estado === 'calificada' || (estado === 'entregada' && !puedeEdit)) && (
                    <button onClick={() => onDetalle(bitacora)}
                        className="w-full py-2 text-xs font-semibold rounded-lg
                            border border-purple-300 dark:border-purple-700
                            text-purple-700 dark:text-purple-300
                            hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                        {estado === 'calificada' ? '👁️ Ver nota' : '👁️ Ver entrega'}
                    </button>
                )}

                {estado === 'vencida' && (
                    <button disabled
                        className="w-full py-2 text-xs font-semibold rounded-lg
                            bg-red-100 dark:bg-red-900/30 text-red-400 dark:text-red-500
                            cursor-not-allowed opacity-60">
                        Plazo vencido
                    </button>
                )}
            </div>
        </div>
    );
}
