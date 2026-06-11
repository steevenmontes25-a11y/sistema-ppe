import { useState } from 'react';
import { ChevronDown, ChevronRight, Eye } from 'lucide-react';

// ── Constantes de módulo ──────────────────────────────────────────────────────

const NOTA_COLOR = (n) => {
    const v = parseFloat(n);
    if (v >= 9) return 'text-green-600 dark:text-green-400 font-bold';
    if (v >= 7) return 'text-blue-600 dark:text-blue-400 font-bold';
    if (v >= 5) return 'text-yellow-600 dark:text-yellow-400 font-semibold';
    return 'text-red-600 dark:text-red-400 font-semibold';
};

const RANGOS = [
    { min: 0,  max: 4.99,  label: '0–5',   color: 'bg-red-500',   text: 'text-red-700 dark:text-red-400'   },
    { min: 5,  max: 6.99,  label: '5–7',   color: 'bg-yellow-500',text: 'text-yellow-700 dark:text-yellow-400'},
    { min: 7,  max: 8.99,  label: '7–9',   color: 'bg-blue-500',  text: 'text-blue-700 dark:text-blue-400'  },
    { min: 9,  max: 10.01, label: '9–10',  color: 'bg-green-500', text: 'text-green-700 dark:text-green-400'},
];

function DistribucionNotas({ bitacoras }) {
    const total = bitacoras.length;
    if (total === 0) return null;

    const conteos = RANGOS.map(r => ({
        ...r,
        count: bitacoras.filter(b => {
            const n = parseFloat(b.calificacion?.nota ?? 0);
            return n >= r.min && n < r.max;
        }).length,
    }));

    return (
        <div className="flex gap-2 items-end h-14 px-1">
            {conteos.map(r => {
                const pct = total > 0 ? Math.round((r.count / total) * 100) : 0;
                return (
                    <div key={r.label} className="flex flex-col items-center gap-0.5 flex-1">
                        <span className={`text-xs font-semibold ${r.text}`}>{r.count}</span>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-sm overflow-hidden" style={{ height: '28px' }}>
                            <div
                                className={`${r.color} rounded-sm transition-all w-full`}
                                style={{ height: `${pct}%`, marginTop: `${100 - pct}%` }}
                            />
                        </div>
                        <span className={`text-xs ${r.text} opacity-70`}>{r.label}</span>
                    </div>
                );
            })}
        </div>
    );
}

function InitialsAvatar({ name }) {
    const initials = (name || '?').split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('');
    return (
        <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center text-sm font-bold flex-shrink-0">
            {initials}
        </div>
    );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function VistaPorDocente({ porDocente, onVerDetalle }) {
    const [closedDocentes, setClosedDocentes] = useState(new Set());

    const toggle = (id) => {
        setClosedDocentes(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    if (!porDocente || porDocente.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                <p className="text-gray-400 dark:text-gray-500 text-sm">
                    No hay bitácoras calificadas para los filtros seleccionados.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {porDocente.map((grupo) => {
                const docenteId  = grupo.docente?.id;
                const isOpen     = !closedDocentes.has(docenteId);
                const nombreDoc  = grupo.docente?.nombres
                    ? `${grupo.docente.apellidos}, ${grupo.docente.nombres}`
                    : (grupo.docente?.name ?? 'Docente');

                return (
                    <div key={docenteId}
                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">

                        {/* Header */}
                        <button type="button" onClick={() => toggle(docenteId)}
                            className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <InitialsAvatar name={nombreDoc} />
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{nombreDoc}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {grupo.stats.total} calificadas ·
                                    Prom: <span className="font-semibold">{grupo.stats.promedio}/10</span> ·
                                    Aprobados: {grupo.stats.aprobados}/{grupo.stats.total}
                                </p>
                            </div>
                            <div className="flex-shrink-0 mr-3">
                                <DistribucionNotas bitacoras={grupo.bitacoras || []} />
                            </div>
                            {isOpen
                                ? <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
                                : <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />}
                        </button>

                        {/* Tabla */}
                        {isOpen && (
                            <div className="border-t border-gray-100 dark:border-gray-700 overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700">
                                            <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400 dark:text-gray-500">Bitácora N°</th>
                                            <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400 dark:text-gray-500">Estudiante</th>
                                            <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400 dark:text-gray-500">Curso</th>
                                            <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400 dark:text-gray-500">Nota</th>
                                            <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400 dark:text-gray-500">Fecha calif.</th>
                                            <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-400 dark:text-gray-500">Ver</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(grupo.bitacoras || []).map(b => {
                                            const nombre = b.estudiante?.nombres
                                                ? `${b.estudiante.apellidos}, ${b.estudiante.nombres}`
                                                : (b.estudiante?.name ?? '—');
                                            const fechaCalif = b.calificacion?.fecha_calificacion
                                                ? new Date(b.calificacion.fecha_calificacion)
                                                    .toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })
                                                : '—';

                                            return (
                                                <tr key={b.id}
                                                    className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                                    <td className="px-4 py-2.5 text-xs font-semibold text-purple-700 dark:text-purple-300">
                                                        Bitácora {b.config?.numero_global ?? '—'}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-xs font-medium text-gray-900 dark:text-gray-100">{nombre}</td>
                                                    <td className="px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400">{b.curso?.nombre ?? '—'}</td>
                                                    <td className="px-4 py-2.5 text-xs">
                                                        <span className={NOTA_COLOR(b.calificacion?.nota ?? 0)}>
                                                            {b.calificacion ? parseFloat(b.calificacion.nota).toFixed(2) : '—'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400">{fechaCalif}</td>
                                                    <td className="px-4 py-2.5 text-right">
                                                        <button onClick={() => onVerDetalle(b)}
                                                            className="p-1.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/60 transition-colors">
                                                            <Eye size={13} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
