import { useState, useMemo } from 'react';
import { router } from '@inertiajs/react';
import { ChevronDown, ChevronRight, Edit3, CheckSquare, Square, Loader2 } from 'lucide-react';

// ── Constantes de módulo ──────────────────────────────────────────────────────

const ESTADO_CONFIG = {
    presente:    { label: 'Presente',    emoji: '✅', bg: 'bg-green-100 dark:bg-green-900/30',   text: 'text-green-700 dark:text-green-400'  },
    ausente:     { label: 'Ausente',     emoji: '❌', bg: 'bg-red-100 dark:bg-red-900/30',       text: 'text-red-700 dark:text-red-400'      },
    tardanza:    { label: 'Tardanza',    emoji: '⏰', bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400'},
    justificado: { label: 'Justificado', emoji: '📝', bg: 'bg-blue-100 dark:bg-blue-900/30',     text: 'text-blue-700 dark:text-blue-400'    },
};

const ESTADOS_OPCIONES = Object.entries(ESTADO_CONFIG).map(([v, c]) => ({ value: v, label: c.label, emoji: c.emoji }));

const formatFecha = (d) => {
    const str = typeof d === 'string' ? d : String(d);
    const fecha = new Date(str.includes('T') ? str : str + 'T00:00:00');
    return fecha.toLocaleDateString('es-EC', { weekday: 'short', day: '2-digit', month: 'short' });
};

// ── Sub-componentes ───────────────────────────────────────────────────────────

function EstadoBadge({ estado }) {
    const cfg = ESTADO_CONFIG[estado];
    if (!cfg) return null;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
            {cfg.emoji} {cfg.label}
        </span>
    );
}

function InitialsAvatar({ name }) {
    const initials = (name || '?').split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('');
    return (
        <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
            {initials}
        </div>
    );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function TablaAsistencia({ asistencias, onCorregir }) {
    const [closedDocentes, setClosedDocentes] = useState(new Set());
    const [selectedIds,    setSelectedIds]    = useState(new Set());
    const [estadoMasivo,   setEstadoMasivo]   = useState('');
    const [aplicando,      setAplicando]      = useState(false);

    const toggleDocente = (id) => {
        setClosedDocentes(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const selectAllByFecha = (ids) => {
        const allSelected = ids.every(id => selectedIds.has(id));
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (allSelected) {
                ids.forEach(id => next.delete(id));
            } else {
                ids.forEach(id => next.add(id));
            }
            return next;
        });
    };

    const aplicarMasivo = () => {
        if (!estadoMasivo || selectedIds.size === 0) return;
        setAplicando(true);
        const registros = [...selectedIds].map(id => ({ id, estado: estadoMasivo, observacion: null }));
        router.post(route('admin.asistencia.corregir-masivo'), { registros }, {
            onSuccess: () => {
                setSelectedIds(new Set());
                setEstadoMasivo('');
                setAplicando(false);
            },
            onError: () => setAplicando(false),
            preserveScroll: true,
        });
    };

    // Agrupar: docente → curso → fecha
    const grupos = useMemo(() => {
        const docenteMap = new Map();
        asistencias.forEach(a => {
            const dId = a.registrado_por?.id;
            if (!dId) return;
            if (!docenteMap.has(dId)) {
                docenteMap.set(dId, {
                    docente: a.registrado_por,
                    stats: { presente: 0, ausente: 0, tardanza: 0, justificado: 0 },
                    cursoMap: new Map(),
                });
            }
            const dGrupo = docenteMap.get(dId);
            dGrupo.stats[a.estado] = (dGrupo.stats[a.estado] || 0) + 1;

            if (!dGrupo.cursoMap.has(a.curso_id)) {
                dGrupo.cursoMap.set(a.curso_id, { curso: a.curso, fechaMap: new Map() });
            }
            const cGrupo = dGrupo.cursoMap.get(a.curso_id);

            const fechaKey = typeof a.fecha === 'string' ? a.fecha.split('T')[0] : String(a.fecha);
            if (!cGrupo.fechaMap.has(fechaKey)) cGrupo.fechaMap.set(fechaKey, []);
            cGrupo.fechaMap.get(fechaKey).push(a);
        });

        return Array.from(docenteMap.values()).map(d => ({
            ...d,
            cursos: Array.from(d.cursoMap.values()).map(c => ({
                ...c,
                fechas: Array.from(c.fechaMap.entries())
                    .sort(([a], [b]) => new Date(b) - new Date(a))
                    .map(([fecha, registros]) => ({ fecha, registros })),
            })),
        }));
    }, [asistencias]);

    if (asistencias.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                <p className="text-gray-400 dark:text-gray-500 text-sm">No hay registros de asistencia para los filtros seleccionados.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {grupos.map(({ docente, stats, cursos }) => {
                const docenteId  = docente?.id;
                const isOpen     = !closedDocentes.has(docenteId);
                const nombreDoc  = docente?.apellidos
                    ? `${docente.apellidos}, ${docente.nombres}`
                    : (docente?.name ?? 'Sin docente');
                const totalDoc   = Object.values(stats).reduce((a, b) => a + b, 0);

                return (
                    <div key={docenteId}
                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">

                        {/* Header docente */}
                        <button
                            type="button"
                            onClick={() => toggleDocente(docenteId)}
                            className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <InitialsAvatar name={nombreDoc} />
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{nombreDoc}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {totalDoc} registros · ✅{stats.presente} ❌{stats.ausente} ⏰{stats.tardanza} 📝{stats.justificado}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {cursos.map(c => (
                                    <span key={c.curso?.id}
                                        className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-md text-xs font-medium hidden sm:inline">
                                        {c.curso?.nombre}
                                    </span>
                                ))}
                                {isOpen ? <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
                                        : <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />}
                            </div>
                        </button>

                        {/* Contenido */}
                        {isOpen && (
                            <div className="border-t border-gray-100 dark:border-gray-700">
                                {cursos.map(({ curso, fechas }) => (
                                    <div key={curso?.id}>
                                        {/* Sub-header curso */}
                                        <div className="px-5 py-2.5 bg-gray-50 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                                                📚 {curso?.nombre}{curso?.paralelo ? ` — Paralelo ${curso.paralelo}` : ''}
                                            </span>
                                        </div>

                                        {/* Tabla */}
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/20">
                                                        <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400 dark:text-gray-500 w-10"></th>
                                                        <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400 dark:text-gray-500">Fecha</th>
                                                        <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400 dark:text-gray-500">Estudiante</th>
                                                        <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400 dark:text-gray-500">Matrícula</th>
                                                        <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400 dark:text-gray-500">Estado</th>
                                                        <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400 dark:text-gray-500">Observación</th>
                                                        <th className="px-4 py-2.5 text-xs font-medium text-gray-400 dark:text-gray-500 text-right">Acción</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {fechas.map(({ fecha, registros }) => {
                                                        const fechaIds      = registros.map(r => r.id);
                                                        const todosSelected = fechaIds.every(id => selectedIds.has(id));
                                                        const algunoSelected= fechaIds.some(id => selectedIds.has(id));

                                                        return registros.map((reg, ri) => (
                                                            <tr key={reg.id}
                                                                className={`border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors
                                                                    ${selectedIds.has(reg.id) ? 'bg-purple-50 dark:bg-purple-900/10' : ''}`}>

                                                                {/* Checkbox (solo en primera fila del grupo fecha) */}
                                                                {ri === 0 ? (
                                                                    <td className="px-4 py-2.5" rowSpan={1}>
                                                                        <button type="button"
                                                                            onClick={() => selectAllByFecha(fechaIds)}
                                                                            className="text-purple-500 hover:text-purple-700 dark:hover:text-purple-400 transition-colors"
                                                                            title="Seleccionar todos en esta fecha">
                                                                            {todosSelected
                                                                                ? <CheckSquare size={15} />
                                                                                : algunoSelected
                                                                                    ? <CheckSquare size={15} className="opacity-50" />
                                                                                    : <Square size={15} />}
                                                                        </button>
                                                                    </td>
                                                                ) : (
                                                                    <td className="px-4 py-2.5">
                                                                        <button type="button"
                                                                            onClick={() => toggleSelect(reg.id)}
                                                                            className="text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 transition-colors">
                                                                            {selectedIds.has(reg.id)
                                                                                ? <CheckSquare size={15} className="text-purple-500" />
                                                                                : <Square size={15} />}
                                                                        </button>
                                                                    </td>
                                                                )}

                                                                <td className="px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                                    {ri === 0 ? formatFecha(fecha) : ''}
                                                                </td>
                                                                <td className="px-4 py-2.5">
                                                                    <span className="font-medium text-gray-900 dark:text-gray-100 text-xs">
                                                                        {reg.estudiante?.apellidos
                                                                            ? `${reg.estudiante.apellidos}, ${reg.estudiante.nombres}`
                                                                            : reg.estudiante?.name ?? '—'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400">
                                                                    {reg.estudiante?.numero_matricula ?? '—'}
                                                                </td>
                                                                <td className="px-4 py-2.5">
                                                                    <EstadoBadge estado={reg.estado} />
                                                                    {reg.corregido_por && (
                                                                        <span className="ml-1 text-purple-500 text-xs" title="Corregido">✏️</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-2.5 text-xs text-gray-400 dark:text-gray-500 max-w-[160px] truncate">
                                                                    {reg.observacion ?? '—'}
                                                                </td>
                                                                <td className="px-4 py-2.5 text-right">
                                                                    <button type="button"
                                                                        onClick={() => onCorregir(reg)}
                                                                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-medium hover:bg-purple-200 dark:hover:bg-purple-900/60 transition-colors">
                                                                        <Edit3 size={11} />
                                                                        Corregir
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ));
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Barra flotante de corrección masiva */}
            {selectedIds.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 bg-gray-900 dark:bg-gray-700 text-white rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-4 border border-gray-700 dark:border-gray-600">
                    <span className="text-sm font-medium whitespace-nowrap">
                        {selectedIds.size} seleccionado{selectedIds.size !== 1 ? 's' : ''}
                    </span>
                    <div className="h-5 w-px bg-gray-600" />
                    <select value={estadoMasivo} onChange={e => setEstadoMasivo(e.target.value)}
                        className="bg-gray-800 dark:bg-gray-600 text-white text-sm rounded-lg px-2 py-1.5 border border-gray-600 focus:ring-1 focus:ring-purple-500 outline-none">
                        <option value="">Cambiar a...</option>
                        {ESTADOS_OPCIONES.map(o => (
                            <option key={o.value} value={o.value}>{o.emoji} {o.label}</option>
                        ))}
                    </select>
                    <button onClick={aplicarMasivo}
                        disabled={!estadoMasivo || aplicando}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-40">
                        {aplicando && <Loader2 size={12} className="animate-spin" />}
                        Aplicar
                    </button>
                    <button onClick={() => setSelectedIds(new Set())}
                        className="px-3 py-1.5 bg-gray-700 dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-500 text-white rounded-lg text-sm transition-colors">
                        Cancelar
                    </button>
                </div>
            )}
        </div>
    );
}
