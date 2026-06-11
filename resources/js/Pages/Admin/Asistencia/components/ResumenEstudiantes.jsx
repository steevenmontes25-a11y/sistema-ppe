import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, TrendingUp, Calendar } from 'lucide-react';

// ── Constantes de módulo ──────────────────────────────────────────────────────

const ESTADO_CONFIG = {
    presente:    { label: 'Presente',    emoji: '✅', bg: 'bg-green-100 dark:bg-green-900/30',   text: 'text-green-700 dark:text-green-400',  dot: 'bg-green-500' },
    ausente:     { label: 'Ausente',     emoji: '❌', bg: 'bg-red-100 dark:bg-red-900/30',       text: 'text-red-700 dark:text-red-400',      dot: 'bg-red-500'   },
    tardanza:    { label: 'Tardanza',    emoji: '⏰', bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-500'},
    justificado: { label: 'Justificado', emoji: '📝', bg: 'bg-blue-100 dark:bg-blue-900/30',     text: 'text-blue-700 dark:text-blue-400',     dot: 'bg-blue-500'  },
};

const formatFechaCorta = (d) => {
    if (!d) return '—';
    const str = typeof d === 'string' ? d : String(d);
    const fecha = new Date(str.includes('T') ? str : str + 'T00:00:00');
    return fecha.toLocaleDateString('es-EC', { day: '2-digit', month: 'short' });
};

// ── MiniCalendario ────────────────────────────────────────────────────────────

function MiniCalendario({ asistencias, year, month }) {
    if (!year || !month) return null;

    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDOW    = new Date(year, month - 1, 1).getDay();
    const HEADERS     = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

    const byDate = {};
    asistencias.forEach(a => {
        const str = typeof a.fecha === 'string' ? a.fecha : String(a.fecha);
        byDate[str.split('T')[0]] = a.estado;
    });

    const cells = [];
    for (let i = 0; i < firstDOW; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
        const key = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        cells.push({ day: d, estado: byDate[key] ?? null });
    }

    return (
        <div>
            <div className="grid grid-cols-7 gap-0.5 mb-1">
                {HEADERS.map(h => (
                    <div key={h} className="text-center text-xs font-medium text-gray-400 dark:text-gray-500 py-0.5">{h}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
                {cells.map((cell, i) => {
                    const cfg = cell?.estado ? ESTADO_CONFIG[cell.estado] : null;
                    return (
                        <div key={i}
                            className={`h-7 w-7 mx-auto rounded-full flex items-center justify-center text-xs font-medium transition-colors
                                ${!cell ? '' : cfg
                                    ? `${cfg.bg} ${cfg.text}`
                                    : 'text-gray-300 dark:text-gray-600'}`}
                            title={cell?.estado ? `${ESTADO_CONFIG[cell.estado]?.label}` : ''}>
                            {cell?.day ?? ''}
                        </div>
                    );
                })}
            </div>
            {/* Leyenda */}
            <div className="flex flex-wrap gap-2 mt-3">
                {Object.entries(ESTADO_CONFIG).map(([k, c]) => (
                    <div key={k} className="flex items-center gap-1">
                        <div className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
                        <span className="text-xs text-gray-500 dark:text-gray-400">{c.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── ResumenDetalleModal ───────────────────────────────────────────────────────

function ResumenDetalleModal({ isOpen, resumen, asistencias, filtros, onClose }) {
    if (!isOpen || !resumen) return null;

    const estudianteId = resumen.estudiante?.id;
    const registros = (asistencias || []).filter(a => a.estudiante_id === estudianteId);

    const [calYear, calMonth] = filtros?.fecha_desde
        ? filtros.fecha_desde.split('-').map(Number)
        : [new Date().getFullYear(), new Date().getMonth() + 1];

    const nombreCompleto = resumen.estudiante?.nombres
        ? `${resumen.estudiante.nombres} ${resumen.estudiante.apellidos}`
        : (resumen.estudiante?.name ?? '—');

    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />

            <div
                className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden"
                style={{ zIndex: 10000 }}
                onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="bg-gradient-to-r from-purple-700 to-purple-900 px-5 py-4 flex items-center gap-3 flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-white text-sm">
                        {(nombreCompleto).split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-white font-bold text-base">{nombreCompleto}</h2>
                        <p className="text-purple-200 text-xs">
                            {resumen.estudiante?.numero_matricula ?? ''} · {registros.length} registros en el período
                        </p>
                    </div>
                    <button onClick={onClose}
                        className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-5 space-y-5">

                    {/* Stats rápidas */}
                    <div className="grid grid-cols-4 gap-2">
                        {Object.entries(ESTADO_CONFIG).map(([k, c]) => (
                            <div key={k} className={`${c.bg} rounded-xl p-3 text-center`}>
                                <p className="text-2xl font-bold">{resumen[k] ?? 0}</p>
                                <p className={`text-xs font-medium ${c.text}`}>{c.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Barra de asistencia */}
                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Asistencia general</span>
                            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                {resumen.porcentaje_asistencia}%
                            </span>
                        </div>
                        <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all"
                                style={{ width: `${resumen.porcentaje_asistencia}%` }} />
                        </div>
                    </div>

                    {/* Mini calendario */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                            <Calendar size={14} className="text-purple-500" />
                            Calendario del mes
                        </h3>
                        <MiniCalendario asistencias={registros} year={calYear} month={calMonth} />
                    </div>

                    {/* Historial de registros */}
                    {registros.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Historial de asistencias
                            </h3>
                            <div className="space-y-1.5">
                                {registros.map(r => {
                                    const cfg = ESTADO_CONFIG[r.estado];
                                    const fechaStr = typeof r.fecha === 'string' ? r.fecha : String(r.fecha);
                                    return (
                                        <div key={r.id}
                                            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                            <span className="text-xs text-gray-500 dark:text-gray-400 w-20 flex-shrink-0">
                                                {formatFechaCorta(fechaStr)}
                                            </span>
                                            {cfg && (
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                                                    {cfg.emoji} {cfg.label}
                                                </span>
                                            )}
                                            {r.observacion && (
                                                <span className="text-xs text-gray-400 dark:text-gray-500 truncate flex-1">
                                                    {r.observacion}
                                                </span>
                                            )}
                                            {r.corregido_por && (
                                                <span className="text-xs text-purple-500 dark:text-purple-400 flex-shrink-0">✏️ corregido</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function ResumenEstudiantes({ resumenEstudiantes, asistencias, filtros }) {
    const [detalleResumen, setDetalleResumen] = useState(null);

    if (!resumenEstudiantes || resumenEstudiantes.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                <p className="text-gray-400 dark:text-gray-500 text-sm">Sin datos de estudiantes para el período seleccionado.</p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">#</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Estudiante</th>
                                <th className="px-5 py-3 text-center text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">✅ Pres.</th>
                                <th className="px-5 py-3 text-center text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">❌ Aus.</th>
                                <th className="px-5 py-3 text-center text-xs font-semibold text-yellow-600 dark:text-yellow-400 uppercase tracking-wide">⏰ Tard.</th>
                                <th className="px-5 py-3 text-center text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">📝 Just.</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Asistencia</th>
                                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Detalle</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resumenEstudiantes.map((r, idx) => {
                                const nombre = r.estudiante?.nombres
                                    ? `${r.estudiante.apellidos}, ${r.estudiante.nombres}`
                                    : (r.estudiante?.name ?? '—');
                                const pct = r.porcentaje_asistencia ?? 0;
                                const pctColor = pct >= 90 ? 'bg-green-500'
                                    : pct >= 75 ? 'bg-yellow-500'
                                    : 'bg-red-500';

                                return (
                                    <tr key={r.estudiante?.id ?? idx}
                                        className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-5 py-3 text-xs text-gray-400 dark:text-gray-500">{idx + 1}</td>
                                        <td className="px-5 py-3">
                                            <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{nombre}</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                                {r.estudiante?.numero_matricula ?? ''} · {r.total} registros
                                            </p>
                                        </td>
                                        <td className="px-5 py-3 text-center font-semibold text-green-700 dark:text-green-400">{r.presente}</td>
                                        <td className="px-5 py-3 text-center font-semibold text-red-700 dark:text-red-400">{r.ausente}</td>
                                        <td className="px-5 py-3 text-center font-semibold text-yellow-700 dark:text-yellow-400">{r.tardanza}</td>
                                        <td className="px-5 py-3 text-center font-semibold text-blue-700 dark:text-blue-400">{r.justificado}</td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden min-w-[60px]">
                                                    <div className={`h-full rounded-full transition-all ${pctColor}`}
                                                        style={{ width: `${pct}%` }} />
                                                </div>
                                                <span className={`text-xs font-bold w-10 text-right
                                                    ${pct >= 90 ? 'text-green-600 dark:text-green-400'
                                                        : pct >= 75 ? 'text-yellow-600 dark:text-yellow-400'
                                                        : 'text-red-600 dark:text-red-400'}`}>
                                                    {pct}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <button type="button"
                                                onClick={() => setDetalleResumen(r)}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-medium hover:bg-purple-200 dark:hover:bg-purple-900/60 transition-colors">
                                                <TrendingUp size={11} />
                                                Ver detalle
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <ResumenDetalleModal
                isOpen={!!detalleResumen}
                resumen={detalleResumen}
                asistencias={asistencias}
                filtros={filtros}
                onClose={() => setDetalleResumen(null)}
            />
        </>
    );
}
