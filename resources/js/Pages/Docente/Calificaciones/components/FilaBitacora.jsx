import { AlertTriangle } from 'lucide-react';

// ── Constantes módulo (evita purga Tailwind) ──────────────────────────────────

const BADGE_CLS = {
    sin_entregar: 'bg-gray-100 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400',
    pendiente:    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    calificada:   'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
};
const BADGE_LABEL = {
    sin_entregar: 'Sin entregar',
    pendiente:    '⏳ Por calificar',
    calificada:   '✅ Calificada',
};
const ROW_BG = {
    sin_entregar: 'bg-gray-50/50 dark:bg-gray-800/50',
    pendiente:    'bg-yellow-50/30 dark:bg-yellow-900/10',
    calificada:   'bg-green-50/30 dark:bg-green-900/10',
};
const NOTA_TEXT = {
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

function tipoBadge(tipo) {
    if (!tipo) return 'Archivo';
    if (tipo.toLowerCase().includes('pdf'))   return 'PDF';
    if (tipo.toLowerCase().includes('image')) return 'Foto';
    return 'Archivo';
}

function initials(name) {
    return (name || '').split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase() || '?';
}

function actividadVencida(config) {
    if (!config?.actividad?.fecha_finalizacion) return false;
    const fin = new Date(String(config.actividad.fecha_finalizacion).slice(0, 10) + 'T23:59:59');
    return fin < new Date();
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function FilaBitacora({ fila, config, onCalificar, onNoEntrega }) {
    const { estudiante, entrega, calificacion, estado } = fila;
    const esNoEntregaRecord = entrega?.archivo_tipo === 'ninguno' || entrega?.archivo_path === 'sin_entrega';
    const vencida = actividadVencida(config);

    return (
        <tr className={`border-b border-gray-100 dark:border-gray-700/60 transition-colors ${ROW_BG[estado] ?? ''}`}>

            {/* Estudiante */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0
                        bg-purple-500 flex items-center justify-center">
                        {estudiante.foto_url?.includes('ui-avatars') ? (
                            <span className="text-white text-[10px] font-bold select-none">
                                {initials(estudiante.nombre_completo)}
                            </span>
                        ) : (
                            <img src={estudiante.foto_url} alt={estudiante.nombre_completo}
                                className="w-full h-full object-cover" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate leading-tight">
                            {estudiante.nombre_completo}
                        </p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500">
                            {estudiante.numero_matricula}
                        </p>
                    </div>
                </div>
            </td>

            {/* Estado */}
            <td className="px-4 py-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${BADGE_CLS[estado]}`}>
                    {BADGE_LABEL[estado]}
                </span>
            </td>

            {/* Archivo */}
            <td className="px-4 py-3">
                {entrega && !esNoEntregaRecord ? (
                    <div className="flex items-center gap-1.5">
                        <a href={entrega.archivo_url} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium
                                border border-gray-200 dark:border-gray-600 rounded-lg
                                text-gray-600 dark:text-gray-400
                                hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            📄 Ver
                        </a>
                        <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700
                            text-gray-500 dark:text-gray-400 text-[10px] font-medium rounded">
                            {tipoBadge(entrega.archivo_tipo)}
                        </span>
                    </div>
                ) : esNoEntregaRecord ? (
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 italic">Sin archivo</span>
                ) : (
                    <span className="text-gray-300 dark:text-gray-600 text-sm">—</span>
                )}
            </td>

            {/* Nota */}
            <td className="px-4 py-3">
                {calificacion ? (
                    <span className={`text-base font-bold ${NOTA_TEXT[notaColorKey(calificacion.nota)]}`}>
                        {parseFloat(calificacion.nota).toFixed(1)}
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-normal">/10</span>
                    </span>
                ) : (
                    <span className="text-gray-300 dark:text-gray-600 text-sm">—</span>
                )}
            </td>

            {/* Justificación */}
            <td className="px-4 py-3 max-w-[200px]">
                {calificacion?.justificacion ? (
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate"
                        title={calificacion.justificacion}>
                        {calificacion.justificacion.length > 45
                            ? calificacion.justificacion.slice(0, 45) + '…'
                            : calificacion.justificacion}
                    </p>
                ) : (
                    <span className="text-gray-300 dark:text-gray-600 text-sm">—</span>
                )}
            </td>

            {/* Acción */}
            <td className="px-4 py-3">
                {estado === 'sin_entregar' ? (
                    vencida ? (
                        <button onClick={() => onNoEntrega(fila)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium
                                bg-red-100 dark:bg-red-900/30
                                text-red-700 dark:text-red-400
                                border border-red-300 dark:border-red-700
                                rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                            <AlertTriangle size={12} />
                            Poner nota (no entregó)
                        </button>
                    ) : (
                        <span className="text-xs text-gray-400 dark:text-gray-600 italic">
                            Sin entrega · Plazo activo
                        </span>
                    )
                ) : estado === 'pendiente' ? (
                    <button onClick={() => onCalificar(fila)}
                        className="px-3 py-1.5 text-xs font-semibold
                            bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                        ✏️ Calificar
                    </button>
                ) : (
                    <button onClick={() => onCalificar(fila)}
                        className="px-3 py-1.5 text-xs font-semibold
                            border border-purple-300 dark:border-purple-700
                            text-purple-700 dark:text-purple-300
                            hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors">
                        ✏️ Editar nota
                    </button>
                )}
            </td>
        </tr>
    );
}
