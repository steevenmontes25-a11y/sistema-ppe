import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, PenLine, Trash2, Calendar, BookOpen,
         FileText, ChevronUp, ChevronDown, AlertTriangle } from 'lucide-react';

// ── Constantes de módulo ──────────────────────────────────────────────────────

const ESTADO_CONFIG = {
    planificada: { label: 'Planificada', cls: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' },
    activa:      { label: 'Activa',      cls: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' },
    cerrada:     { label: 'Cerrada',     cls: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' },
};

// ── ConfirmDialog ─────────────────────────────────────────────────────────────

function ConfirmDialog({ isOpen, titulo, mensaje, onConfirmar, onCancelar }) {
    if (!isOpen) return null;
    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 10001 }}>
            <div className="absolute inset-0 bg-black/60" onClick={onCancelar} />
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6"
                style={{ zIndex: 10002 }}
                onClick={e => e.stopPropagation()}>
                <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">{titulo}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{mensaje}</p>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-5">
                    <button onClick={onCancelar}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={onConfirmar}
                        className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors">
                        Eliminar
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

// ── ActionsDropdown ───────────────────────────────────────────────────────────

function ActionsDropdown({ fase, onEditar, onEliminar }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const puedeEliminar = (fase.stats?.actividades ?? 0) === 0
        && (fase.stats?.bitacoras_entregadas ?? 0) === 0;

    return (
        <div className="relative" ref={ref}>
            <button onClick={() => setOpen(!open)}
                className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <MoreVertical size={16} />
            </button>
            {open && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-20 overflow-hidden py-1">
                    <button onClick={() => { setOpen(false); onEditar(); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <PenLine size={14} /> Editar fase
                    </button>
                    <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                    {puedeEliminar ? (
                        <button onClick={() => { setOpen(false); onEliminar(); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                            <Trash2 size={14} /> Eliminar
                        </button>
                    ) : (
                        <div className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 dark:text-gray-600 cursor-not-allowed"
                            title="Tiene actividades o bitácoras entregadas">
                            <Trash2 size={14} /> Eliminar
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function FaseCard({ fase, isFirst, isLast, onEditar, onMoverArriba, onMoverAbajo, onEliminar }) {
    const [confirmEliminar, setConfirmEliminar] = useState(false);

    const estadoCfg = ESTADO_CONFIG[fase.estado] ?? ESTADO_CONFIG.planificada;
    const pct       = fase.progreso ?? 0;

    const fmt = (d) => new Date(d + 'T00:00:00').toLocaleDateString('es-EC', {
        day: '2-digit', month: 'short', year: 'numeric',
    });

    return (
        <>
            <div className="flex items-stretch gap-2">
                {/* Botones reordenamiento */}
                <div className="flex flex-col justify-center gap-1 flex-shrink-0">
                    <button
                        onClick={onMoverArriba}
                        disabled={isFirst}
                        title="Mover arriba"
                        className={`p-1.5 rounded-lg transition-colors
                            ${isFirst
                                ? 'text-gray-200 dark:text-gray-700 cursor-not-allowed'
                                : 'text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                            }`}>
                        <ChevronUp size={16} />
                    </button>
                    <button
                        onClick={onMoverAbajo}
                        disabled={isLast}
                        title="Mover abajo"
                        className={`p-1.5 rounded-lg transition-colors
                            ${isLast
                                ? 'text-gray-200 dark:text-gray-700 cursor-not-allowed'
                                : 'text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                            }`}>
                        <ChevronDown size={16} />
                    </button>
                </div>

                {/* Card */}
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    {/* Fila superior */}
                    <div className="flex items-center gap-3 mb-3">
                        {/* Círculo de orden */}
                        <div className="w-10 h-10 rounded-full bg-purple-600 text-white font-bold text-lg flex items-center justify-center flex-shrink-0">
                            {fase.orden}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${estadoCfg.cls}`}>
                                    {estadoCfg.label}
                                </span>
                                {fase.rango_bitacoras && (
                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                                        Bitácoras {fase.rango_bitacoras}
                                    </span>
                                )}
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
                                {fase.nombre}
                            </h3>
                        </div>

                        <ActionsDropdown
                            fase={fase}
                            onEditar={() => onEditar(fase)}
                            onEliminar={() => setConfirmEliminar(true)}
                        />
                    </div>

                    {/* Fechas */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <Calendar size={11} className="flex-shrink-0" />
                        <span>{fmt(fase.fecha_inicio)} → {fmt(fase.fecha_fin)}</span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-3 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                            <BookOpen size={11} />
                            <span>{fase.stats?.actividades ?? 0} act.</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <FileText size={11} />
                            <span>{fase.stats?.bitacoras_entregadas ?? 0} ent.</span>
                        </div>
                    </div>

                    {/* Barra de progreso */}
                    <div>
                        <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mb-1">
                            <span>Progreso</span>
                            <span>{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-600 rounded-full transition-all"
                                style={{ width: `${pct}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                isOpen={confirmEliminar}
                titulo={`¿Eliminar "${fase.nombre}"?`}
                mensaje="Las bitácoras config de esta fase también serán eliminadas. Esta acción no se puede deshacer."
                onConfirmar={() => { onEliminar(fase); setConfirmEliminar(false); }}
                onCancelar={() => setConfirmEliminar(false)}
            />
        </>
    );
}
