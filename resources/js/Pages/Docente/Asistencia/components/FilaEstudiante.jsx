// ── Constantes de módulo ──────────────────────────────────────────────────────

const ESTADOS = [
    { value: 'presente',    label: 'P', title: 'Presente',    activeCls: 'bg-green-500 text-white ring-2 ring-green-300'   },
    { value: 'ausente',     label: 'A', title: 'Ausente',     activeCls: 'bg-red-500 text-white ring-2 ring-red-300'       },
    { value: 'tardanza',    label: 'T', title: 'Tardanza',    activeCls: 'bg-yellow-500 text-white ring-2 ring-yellow-300' },
    { value: 'justificado', label: 'J', title: 'Justificado', activeCls: 'bg-blue-500 text-white ring-2 ring-blue-300'     },
];

const ROW_BG = {
    presente:    '',
    ausente:     'bg-red-50/50 dark:bg-red-900/10',
    tardanza:    'bg-yellow-50/50 dark:bg-yellow-900/10',
    justificado: 'bg-blue-50/50 dark:bg-blue-900/10',
};

const INACTIVE_BTN = 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600';

const COLORS = ['bg-purple-500','bg-blue-500','bg-green-500','bg-pink-500','bg-indigo-500','bg-yellow-500'];
function avatarColor(name) { return COLORS[(name?.charCodeAt(0) ?? 0) % COLORS.length]; }
function initials(name) { return (name||'').split(' ').filter(Boolean).slice(0,2).map(p=>p[0]).join('').toUpperCase()||'?'; }

// ── Componente ────────────────────────────────────────────────────────────────

export default function FilaEstudiante({ estudiante, asistencia, onChange }) {
    const estado      = asistencia?.estado      ?? 'presente';
    const observacion = asistencia?.observacion ?? '';
    const needsObs    = estado !== 'presente';
    const rowCls      = ROW_BG[estado] ?? '';

    return (
        <tr className={`border-b border-gray-100 dark:border-gray-700 transition-colors ${rowCls}`}>

            {/* Estudiante */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                        {estudiante.foto
                            ? <img src={estudiante.foto_url} alt={estudiante.nombre_completo}
                                className="w-full h-full object-cover" />
                            : <div className={`w-full h-full flex items-center justify-center ${avatarColor(estudiante.nombre_completo)}`}>
                                <span className="text-white text-xs font-bold select-none">
                                    {initials(estudiante.nombre_completo)}
                                </span>
                              </div>
                        }
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {estudiante.nombre_completo}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            {estudiante.numero_matricula}
                        </p>
                    </div>
                </div>
            </td>

            {/* Botones de estado */}
            <td className="px-4 py-3">
                <div className="flex gap-1.5">
                    {ESTADOS.map(e => (
                        <button key={e.value} type="button" title={e.title}
                            onClick={() => onChange('estado', e.value)}
                            className={`w-8 h-8 rounded-full text-xs font-bold transition-all
                                ${estado === e.value ? e.activeCls : INACTIVE_BTN}`}>
                            {e.label}
                        </button>
                    ))}
                </div>
            </td>

            {/* Observación */}
            <td className="px-4 py-3 min-w-[180px]">
                <input
                    type="text"
                    value={observacion}
                    onChange={e => onChange('observacion', e.target.value)}
                    placeholder="Observación..."
                    disabled={!needsObs}
                    className={`w-full px-2.5 py-1.5 text-xs border rounded-lg outline-none transition
                        ${needsObs
                            ? 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-purple-400'
                            : 'border-transparent bg-transparent text-gray-300 dark:text-gray-600 cursor-not-allowed'
                        }`}
                />
            </td>

            {/* Resumen del mes */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span title="Presentes">✅ {estudiante.resumen_mes.presentes}</span>
                    <span title="Ausentes">❌ {estudiante.resumen_mes.ausentes}</span>
                    <span title="Tardanzas">⏰ {estudiante.resumen_mes.tardanzas}</span>
                    {estudiante.resumen_mes.porcentaje !== null && (
                        <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold
                            ${estudiante.resumen_mes.porcentaje >= 90
                                ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                                : estudiante.resumen_mes.porcentaje >= 70
                                    ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
                                    : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                            }`}>
                            {estudiante.resumen_mes.porcentaje}%
                        </span>
                    )}
                </div>
            </td>
        </tr>
    );
}
