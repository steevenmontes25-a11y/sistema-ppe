import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Lock } from 'lucide-react';

// ── Constantes ────────────────────────────────────────────────────────────────

const TABS_MODAL = [
    { id: 'info',       label: 'Información', icon: '📋' },
    { id: 'asistencia', label: 'Asistencia',  icon: '📅' },
    { id: 'bitacoras',  label: 'Bitácoras',   icon: '📁' },
];

const ESTADO_ASIST = {
    presente:    { label: 'Presente',    cls: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700' },
    ausente:     { label: 'Ausente',     cls: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700' },
    tardanza:    { label: 'Tardanza',    cls: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700' },
    justificado: { label: 'Justificado', cls: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700' },
};

const ESTADO_BIT = {
    calificada: { label: 'Calificada',    rowCls: 'bg-green-50 dark:bg-green-900/20',  badgeCls: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' },
    entregada:  { label: 'Entregada',     rowCls: 'bg-yellow-50 dark:bg-yellow-900/20', badgeCls: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300' },
    pendiente:  { label: 'Sin entregar',  rowCls: 'bg-red-50 dark:bg-red-900/10',       badgeCls: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' },
};

const COLORS = [
    'bg-purple-500', 'bg-blue-500', 'bg-green-500',
    'bg-pink-500',   'bg-indigo-500', 'bg-yellow-500',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getColor(name) {
    return COLORS[(name?.charCodeAt(0) ?? 0) % COLORS.length];
}

function getInitials(name) {
    return (name || '').split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase() || '?';
}

function pctColor(pct) {
    if (pct >= 90) return 'border-green-500 text-green-600 dark:text-green-400';
    if (pct >= 70) return 'border-yellow-500 text-yellow-600 dark:text-yellow-400';
    return 'border-red-500 text-red-600 dark:text-red-400';
}

function ReadField({ label, value }) {
    return (
        <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 uppercase tracking-wide font-medium">{label}</p>
            <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{value || '—'}</p>
        </div>
    );
}

// ── Tab Información ───────────────────────────────────────────────────────────

function TabInfo({ est }) {
    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <ReadField label="Cédula"  value={est.cedula} />
                <ReadField label="Sexo"    value={est.sexo === 'M' ? 'Masculino' : est.sexo === 'F' ? 'Femenino' : est.sexo} />
                <ReadField label="Email"   value={est.email} />
                <ReadField label="Celular" value={est.celular} />
            </div>
            <div className="flex items-start gap-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3">
                <Lock size={14} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                    Solo el Coordinador puede editar los datos del estudiante
                </p>
            </div>
        </div>
    );
}

// ── Tab Asistencia ────────────────────────────────────────────────────────────

const ASIST_BADGES = [
    { key: 'presentes',    label: 'Presente',    icon: '✅', cls: 'bg-green-50  dark:bg-green-900/30  text-green-700  dark:text-green-300  border-green-200  dark:border-green-700'  },
    { key: 'ausentes',     label: 'Ausente',     icon: '❌', cls: 'bg-red-50    dark:bg-red-900/30    text-red-700    dark:text-red-300    border-red-200    dark:border-red-700'    },
    { key: 'tardanzas',    label: 'Tardanza',    icon: '⏰', cls: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700' },
    { key: 'justificados', label: 'Justificado', icon: '📝', cls: 'bg-blue-50   dark:bg-blue-900/30   text-blue-700   dark:text-blue-300   border-blue-200   dark:border-blue-700'   },
];

function TabAsistencia({ est }) {
    const { asistencia, asistencias_recientes } = est;

    return (
        <div className="space-y-5">
            {/* 4 badges */}
            <div className="grid grid-cols-4 gap-3">
                {ASIST_BADGES.map(b => (
                    <div key={b.key}
                        className={`flex flex-col items-center gap-1 rounded-xl border p-3 ${b.cls}`}>
                        <span className="text-xl">{b.icon}</span>
                        <span className="text-lg font-bold">{asistencia[b.key] ?? 0}</span>
                        <span className="text-[10px] font-medium text-center leading-tight">{b.label}</span>
                    </div>
                ))}
            </div>

            {/* Círculo de porcentaje */}
            <div className="flex flex-col items-center gap-2">
                <div className={`w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center ${pctColor(asistencia.porcentaje)}`}>
                    <span className="text-2xl font-bold leading-none">{asistencia.porcentaje}%</span>
                    <span className="text-[9px] text-gray-500 dark:text-gray-400 mt-0.5">asistencia</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {asistencia.presentes} de {asistencia.total} clases
                </p>
            </div>

            {/* Tabla últimas 10 */}
            {asistencias_recientes.length > 0 ? (
                <div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                        Últimas asistencias
                    </p>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <table className="w-full text-xs">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="text-left px-3 py-2 font-semibold text-gray-600 dark:text-gray-400">Fecha</th>
                                    <th className="text-left px-3 py-2 font-semibold text-gray-600 dark:text-gray-400">Estado</th>
                                    <th className="text-left px-3 py-2 font-semibold text-gray-600 dark:text-gray-400">Observación</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {asistencias_recientes.map((a, i) => {
                                    const cfg = ESTADO_ASIST[a.estado] ?? { label: a.estado, cls: 'bg-gray-100 text-gray-600' };
                                    return (
                                        <tr key={i} className="bg-white dark:bg-gray-800">
                                            <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{a.fecha}</td>
                                            <td className="px-3 py-2">
                                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.cls}`}>
                                                    {cfg.label}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                                                {a.observacion || '—'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">
                    Sin registros de asistencia en este período
                </p>
            )}
        </div>
    );
}

// ── Tab Bitácoras ─────────────────────────────────────────────────────────────

function TabBitacoras({ est }) {
    const { bitacoras, bitacoras_lista } = est;

    return (
        <div className="space-y-4">
            {/* Resumen */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-purple-700 dark:text-purple-300">
                        {bitacoras.entregadas}/{bitacoras.total}
                    </p>
                    <p className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">Entregadas</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-green-700 dark:text-green-300">
                        {bitacoras.calificadas}
                    </p>
                    <p className="text-[10px] text-green-600 dark:text-green-400 font-medium">Calificadas</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                        {bitacoras.promedio !== null ? `${bitacoras.promedio}/10` : '—'}
                    </p>
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">Promedio</p>
                </div>
            </div>

            {/* Tabla */}
            {bitacoras_lista.length > 0 ? (
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <table className="w-full text-xs">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="text-left px-3 py-2 font-semibold text-gray-600 dark:text-gray-400 w-8">N°</th>
                                <th className="text-left px-3 py-2 font-semibold text-gray-600 dark:text-gray-400">Nombre</th>
                                <th className="text-left px-3 py-2 font-semibold text-gray-600 dark:text-gray-400">Estado</th>
                                <th className="text-center px-3 py-2 font-semibold text-gray-600 dark:text-gray-400">Nota</th>
                                <th className="text-left px-3 py-2 font-semibold text-gray-600 dark:text-gray-400">Entrega</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {bitacoras_lista.map((b) => {
                                const cfg = ESTADO_BIT[b.estado] ?? ESTADO_BIT.pendiente;
                                return (
                                    <tr key={b.numero} className={cfg.rowCls}>
                                        <td className="px-3 py-2 font-medium text-gray-600 dark:text-gray-400">{b.numero}</td>
                                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{b.nombre}</td>
                                        <td className="px-3 py-2">
                                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${cfg.badgeCls}`}>
                                                {cfg.label}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-center font-bold text-gray-700 dark:text-gray-300">
                                            {b.nota !== null ? b.nota : '—'}
                                        </td>
                                        <td className="px-3 py-2 text-gray-500 dark:text-gray-400">
                                            {b.fecha || '—'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">
                    Sin bitácoras configuradas para este curso
                </p>
            )}
        </div>
    );
}

// ── Modal principal ───────────────────────────────────────────────────────────

export default function EstudianteDetalleModal({ estudiante, onClose }) {
    const [tab, setTab] = useState('info');

    if (!estudiante) return null;

    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden"
                style={{ zIndex: 10000 }}
                onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="bg-gradient-to-r from-purple-700 to-purple-900 px-6 py-5 flex items-center gap-4 flex-shrink-0">
                    <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-white/30 flex-shrink-0">
                        {estudiante.foto
                            ? <img src={estudiante.foto_url} alt={estudiante.nombre_completo}
                                className="w-full h-full object-cover" />
                            : <div className={`w-full h-full flex items-center justify-center ${getColor(estudiante.nombre_completo)}`}>
                                <span className="text-white font-bold text-xl select-none">
                                    {getInitials(estudiante.nombre_completo)}
                                </span>
                              </div>
                        }
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-white font-bold text-lg leading-tight truncate">
                            {estudiante.nombre_completo}
                        </h2>
                        <p className="text-purple-200 text-sm mt-0.5">
                            {estudiante.numero_matricula}
                            {estudiante.curso && ` · ${estudiante.curso.nombre}`}
                        </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0
                        ${estudiante.estado === 'activo'
                            ? 'bg-green-400/20 text-green-200 border border-green-400/30'
                            : 'bg-gray-400/20 text-gray-300 border border-gray-400/30'
                        }`}>
                        {estudiante.estado === 'activo' ? 'Activo' : 'Inactivo'}
                    </span>
                    <button onClick={onClose}
                        className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0">
                        <X size={18} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 px-6 pt-1 gap-1 flex-shrink-0 bg-white dark:bg-gray-800">
                    {TABS_MODAL.map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                                ${tab === t.id
                                    ? 'border-purple-600 text-purple-700 dark:text-purple-400'
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}>
                            <span>{t.icon}</span> {t.label}
                        </button>
                    ))}
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {tab === 'info'       && <TabInfo       est={estudiante} />}
                    {tab === 'asistencia' && <TabAsistencia est={estudiante} />}
                    {tab === 'bitacoras'  && <TabBitacoras  est={estudiante} />}
                </div>

                {/* Footer */}
                <div className="flex justify-end px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
                    <button onClick={onClose}
                        className="px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
