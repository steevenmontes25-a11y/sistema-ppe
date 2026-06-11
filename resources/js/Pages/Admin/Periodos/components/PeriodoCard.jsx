import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { router } from '@inertiajs/react';
import { MoreVertical, CheckCircle, PenLine, StopCircle, Trash2,
         Calendar, Users, BookOpen, FileText, GraduationCap, AlertTriangle } from 'lucide-react';

// ── Constantes de módulo ──────────────────────────────────────────────────────

const ESTADO_CONFIG = {
    planificacion: { label: 'Planificación', cls: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' },
    en_curso:      { label: 'En Curso',      cls: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' },
    finalizado:    { label: 'Finalizado',    cls: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400' },
    archivado:     { label: 'Archivado',     cls: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500' },
};

// ── ConfirmDialog (createPortal) ──────────────────────────────────────────────

function ConfirmDialog({ isOpen, titulo, mensaje, tipo, labelConfirmar, onConfirmar, onCancelar }) {
    if (!isOpen) return null;

    const colorBtn = tipo === 'danger'
        ? 'bg-red-600 hover:bg-red-700 text-white'
        : 'bg-green-600 hover:bg-green-700 text-white';
    const iconEl = tipo === 'danger'
        ? <AlertTriangle size={20} className="text-red-500" />
        : <CheckCircle size={20} className="text-green-500" />;

    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 10001 }}>
            <div className="absolute inset-0 bg-black/60" onClick={onCancelar} />
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6"
                style={{ zIndex: 10002 }}
                onClick={e => e.stopPropagation()}>
                <div className="flex items-start gap-3 mb-4">
                    <div className="flex-shrink-0 mt-0.5">{iconEl}</div>
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
                        className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${colorBtn}`}>
                        {labelConfirmar}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

// ── ActionsDropdown ───────────────────────────────────────────────────────────

function ActionsDropdown({ periodo, onEditar, onActivar, onDesactivar, onEliminar }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const tieneDatos = (periodo.stats?.estudiantes ?? 0) > 0
        || (periodo.stats?.actividades ?? 0) > 0
        || (periodo.stats?.bitacoras ?? 0) > 0;

    return (
        <div className="relative" ref={ref}>
            <button onClick={() => setOpen(!open)}
                className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <MoreVertical size={16} />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-20 overflow-hidden py-1">
                    {/* Activar */}
                    {!periodo.activo && periodo.estado !== 'archivado' && (
                        <button onClick={() => { setOpen(false); onActivar(); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                            <CheckCircle size={14} />
                            Activar período
                        </button>
                    )}

                    {/* Editar */}
                    <button onClick={() => { setOpen(false); onEditar(); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <PenLine size={14} />
                        Editar
                    </button>

                    {/* Desactivar */}
                    {periodo.activo && (
                        <button onClick={() => { setOpen(false); onDesactivar(); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
                            <StopCircle size={14} />
                            Desactivar
                        </button>
                    )}

                    <div className="border-t border-gray-100 dark:border-gray-700 my-1" />

                    {/* Eliminar */}
                    {tieneDatos ? (
                        <div className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 dark:text-gray-600 cursor-not-allowed"
                            title="El período tiene datos asociados">
                            <Trash2 size={14} />
                            Eliminar
                        </div>
                    ) : (
                        <button onClick={() => { setOpen(false); onEliminar(); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                            <Trash2 size={14} />
                            Eliminar
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function PeriodoCard({ periodo, onEditar }) {
    const [confirmActivar,  setConfirmActivar]  = useState(false);
    const [confirmEliminar, setConfirmEliminar] = useState(false);

    const estadoCfg = ESTADO_CONFIG[periodo.estado] ?? ESTADO_CONFIG.planificacion;
    const pct       = periodo.progreso ?? 0;
    const barColor  = periodo.estado === 'en_curso'   ? 'bg-purple-600'
                    : periodo.estado === 'finalizado' ? 'bg-blue-400'
                    : 'bg-gray-300';

    const fmt = (d) => new Date(d + 'T00:00:00').toLocaleDateString('es-EC', {
        day: '2-digit', month: 'short', year: 'numeric',
    });

    const handleActivar = () => {
        router.patch(route('admin.periodos.activar', periodo.id), {}, {
            preserveScroll: true,
        });
        setConfirmActivar(false);
    };

    const handleDesactivar = () => {
        router.patch(route('admin.periodos.desactivar', periodo.id), {}, {
            preserveScroll: true,
        });
    };

    const handleEliminar = () => {
        router.delete(route('admin.periodos.destroy', periodo.id), {
            preserveScroll: true,
        });
        setConfirmEliminar(false);
    };

    return (
        <>
            <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5
                ${periodo.activo ? 'border-l-4 border-l-green-500' : ''}`}>

                {/* Fila superior */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${estadoCfg.cls}`}>
                            {estadoCfg.label}
                        </span>
                        {periodo.activo && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-500 text-white flex-shrink-0">
                                ACTIVO
                            </span>
                        )}
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base truncate">
                            {periodo.nombre}
                        </h3>
                    </div>
                    <ActionsDropdown
                        periodo={periodo}
                        onEditar={() => onEditar(periodo)}
                        onActivar={() => setConfirmActivar(true)}
                        onDesactivar={handleDesactivar}
                        onEliminar={() => setConfirmEliminar(true)}
                    />
                </div>

                {/* Fechas y duración */}
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <Calendar size={12} className="flex-shrink-0" />
                    <span>{fmt(periodo.fecha_inicio)} → {fmt(periodo.fecha_fin)}</span>
                    <span className="opacity-40">·</span>
                    <span>{periodo.duracion_dias} días</span>
                </div>

                {/* Barra de progreso */}
                <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mb-1">
                        <span>Progreso</span>
                        <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${barColor}`}
                            style={{ width: `${pct}%` }} />
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                        { icon: Users,        label: 'est.',  val: periodo.stats?.estudiantes ?? 0 },
                        { icon: GraduationCap,label: 'doc.',  val: periodo.stats?.docentes    ?? 0 },
                        { icon: BookOpen,     label: 'act.',  val: periodo.stats?.actividades  ?? 0 },
                        { icon: FileText,     label: 'bit.',  val: periodo.stats?.bitacoras    ?? 0 },
                    ].map(({ icon: Icon, label, val }) => (
                        <div key={label}
                            className="bg-gray-50 dark:bg-gray-700/50 rounded-lg py-2">
                            <Icon size={13} className="text-gray-400 dark:text-gray-500 mx-auto mb-0.5" />
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{val}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Descripción */}
                {periodo.descripcion && (
                    <p className="mt-3 text-xs text-gray-400 dark:text-gray-500 italic leading-relaxed">
                        {periodo.descripcion}
                    </p>
                )}
            </div>

            {/* Confirm: Activar */}
            <ConfirmDialog
                isOpen={confirmActivar}
                titulo={`¿Activar período "${periodo.nombre}"?`}
                mensaje="Se desactivará el período actual si hay uno activo. Todos los módulos usarán este período como referencia."
                tipo="success"
                labelConfirmar="✅ Activar período"
                onConfirmar={handleActivar}
                onCancelar={() => setConfirmActivar(false)}
            />

            {/* Confirm: Eliminar */}
            <ConfirmDialog
                isOpen={confirmEliminar}
                titulo={`¿Eliminar período "${periodo.nombre}"?`}
                mensaje="Esta acción no se puede deshacer."
                tipo="danger"
                labelConfirmar="Eliminar"
                onConfirmar={handleEliminar}
                onCancelar={() => setConfirmEliminar(false)}
            />
        </>
    );
}
