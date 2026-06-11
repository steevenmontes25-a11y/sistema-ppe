import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from '@inertiajs/react';
import { X, Layers, Calendar, Info, Save } from 'lucide-react';

// ── Constantes de módulo ──────────────────────────────────────────────────────

const ESTADOS_OPCIONES = [
    { value: 'planificada', icon: '📋', label: 'Planificada', desc: 'En preparación, aún no ha iniciado.' },
    { value: 'activa',      icon: '▶️', label: 'Activa',      desc: 'En progreso actualmente.' },
    { value: 'cerrada',     icon: '✅', label: 'Cerrada',     desc: 'Finalizada y cerrada.' },
];

const inputCls = `w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600
    bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100
    rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition`;

const labelCls = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5';

// ── Componente principal ──────────────────────────────────────────────────────

export default function FaseModal({ isOpen, fase, periodos, cursos, periodoSeleccionado, cursoPreselect, onClose }) {
    const esEdicion = fase !== null;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        nombre:             '',
        descripcion:        '',
        periodo_lectivo_id: periodoSeleccionado?.id ?? '',
        curso_id:           '',
        fecha_inicio:       '',
        fecha_fin:          '',
        estado:             'planificada',
    });

    useEffect(() => {
        if (isOpen) {
            if (fase) {
                setData({
                    nombre:             fase.nombre             ?? '',
                    descripcion:        fase.descripcion        ?? '',
                    periodo_lectivo_id: fase.periodo_lectivo_id ?? periodoSeleccionado?.id ?? '',
                    curso_id:           fase.curso_id           ?? '',
                    fecha_inicio:       fase.fecha_inicio       ?? '',
                    fecha_fin:          fase.fecha_fin          ?? '',
                    estado:             fase.estado             ?? 'planificada',
                });
            } else {
                reset();
                setData({
                    nombre:             '',
                    descripcion:        '',
                    periodo_lectivo_id: periodoSeleccionado?.id ?? '',
                    curso_id:           cursoPreselect?.id ?? '',
                    fecha_inicio:       '',
                    fecha_fin:          '',
                    estado:             'planificada',
                });
            }
            clearErrors();
        }
    }, [isOpen, fase?.id, cursoPreselect?.id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const opts = { preserveScroll: true, onSuccess: () => onClose() };
        if (esEdicion) {
            put(route('admin.fases.update', fase.id), opts);
        } else {
            post(route('admin.fases.store'), opts);
        }
    };

    const dias = data.fecha_inicio && data.fecha_fin
        ? Math.round((new Date(data.fecha_fin) - new Date(data.fecha_inicio)) / 86400000)
        : null;

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden"
                style={{ zIndex: 10000 }}
                onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="bg-gradient-to-r from-purple-700 to-purple-900 px-5 py-4 flex items-center gap-3 flex-shrink-0">
                    <div className="p-2 bg-white/15 rounded-xl">
                        <Layers size={18} className="text-white" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-white font-bold text-base">
                            {esEdicion ? 'Editar Fase PPE' : 'Nueva Fase PPE'}
                        </h2>
                        <p className="text-purple-200 text-xs">
                            {esEdicion ? `Modificando "${fase.nombre}"` : 'Crear nueva fase del programa PPE'}
                        </p>
                    </div>
                    <button onClick={onClose}
                        className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="p-5 space-y-6">

                        {/* Sección 1 — Identificación */}
                        <div>
                            <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                                Identificación
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <label className={labelCls}>
                                        Nombre <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nombre}
                                        onChange={e => setData('nombre', e.target.value)}
                                        placeholder="Fase 1: Diagnóstico"
                                        className={inputCls + (errors.nombre ? ' border-red-400 focus:ring-red-400' : '')}
                                    />
                                    {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
                                </div>
                                <div>
                                    <label className={labelCls}>Descripción <span className="text-gray-400">(opcional)</span></label>
                                    <textarea
                                        value={data.descripcion}
                                        onChange={e => setData('descripcion', e.target.value)}
                                        rows={2}
                                        placeholder="Breve descripción de los objetivos de la fase..."
                                        className={inputCls + ' resize-none'}
                                    />
                                    {errors.descripcion && <p className="text-red-500 text-xs mt-1">{errors.descripcion}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Sección 2 — Asignación */}
                        <div>
                            <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                                Asignación
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelCls}>
                                        Período Lectivo <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.periodo_lectivo_id}
                                        onChange={e => setData('periodo_lectivo_id', e.target.value)}
                                        disabled={esEdicion}
                                        className={inputCls + (esEdicion ? ' opacity-60 cursor-not-allowed' : '') + (errors.periodo_lectivo_id ? ' border-red-400' : '')}
                                    >
                                        <option value="">Seleccionar período...</option>
                                        {periodos.map(p => (
                                            <option key={p.id} value={p.id}>{p.nombre}</option>
                                        ))}
                                    </select>
                                    {errors.periodo_lectivo_id && <p className="text-red-500 text-xs mt-1">{errors.periodo_lectivo_id}</p>}
                                </div>
                                <div>
                                    <label className={labelCls}>
                                        Curso <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.curso_id}
                                        onChange={e => setData('curso_id', e.target.value)}
                                        disabled={esEdicion}
                                        className={inputCls + (esEdicion ? ' opacity-60 cursor-not-allowed' : '') + (errors.curso_id ? ' border-red-400' : '')}
                                    >
                                        <option value="">Seleccionar curso...</option>
                                        {cursos.map(c => (
                                            <option key={c.id} value={c.id}>{c.nombre}</option>
                                        ))}
                                    </select>
                                    {errors.curso_id && <p className="text-red-500 text-xs mt-1">{errors.curso_id}</p>}
                                </div>
                            </div>
                            {esEdicion && (
                                <div className="mt-3 flex items-start gap-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5">
                                    <Info size={13} className="text-gray-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        El período y curso no se pueden cambiar después de crear la fase.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Sección 3 — Duración */}
                        <div>
                            <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                                Duración
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelCls}>
                                        Fecha inicio <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={data.fecha_inicio}
                                        onChange={e => setData('fecha_inicio', e.target.value)}
                                        className={inputCls + (errors.fecha_inicio ? ' border-red-400' : '')}
                                    />
                                    {errors.fecha_inicio && <p className="text-red-500 text-xs mt-1">{errors.fecha_inicio}</p>}
                                </div>
                                <div>
                                    <label className={labelCls}>
                                        Fecha fin <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={data.fecha_fin}
                                        onChange={e => setData('fecha_fin', e.target.value)}
                                        className={inputCls + (errors.fecha_fin ? ' border-red-400' : '')}
                                    />
                                    {errors.fecha_fin && <p className="text-red-500 text-xs mt-1">{errors.fecha_fin}</p>}
                                </div>
                            </div>
                            {dias !== null && dias > 0 && (
                                <div className="mt-3 flex items-center gap-2.5 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl px-4 py-2.5">
                                    <Calendar size={14} className="text-purple-600 dark:text-purple-400 flex-shrink-0" />
                                    <p className="text-sm text-purple-800 dark:text-purple-200">
                                        <span className="font-semibold">Duración: {dias} días</span>
                                        <span className="text-purple-500 dark:text-purple-400 ml-2">
                                            ({(dias / 30).toFixed(1)} meses aprox.)
                                        </span>
                                    </p>
                                </div>
                            )}
                            {dias !== null && dias <= 0 && (
                                <p className="text-red-500 text-xs mt-2">La fecha de fin debe ser posterior al inicio.</p>
                            )}
                        </div>

                        {/* Sección 4 — Estado */}
                        <div>
                            <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                                Estado
                            </h3>
                            <div className="grid grid-cols-3 gap-2">
                                {ESTADOS_OPCIONES.map(op => (
                                    <label key={op.value}
                                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border cursor-pointer transition-colors text-center
                                            ${data.estado === op.value
                                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                                : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-700'}`}>
                                        <input
                                            type="radio"
                                            name="estado"
                                            value={op.value}
                                            checked={data.estado === op.value}
                                            onChange={() => setData('estado', op.value)}
                                            className="sr-only"
                                        />
                                        <span className="text-xl">{op.icon}</span>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{op.label}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">{op.desc}</p>
                                    </label>
                                ))}
                            </div>
                            {errors.estado && <p className="text-red-500 text-xs mt-1">{errors.estado}</p>}
                        </div>

                        {/* Sección 5 — Info bitácoras (solo en crear) */}
                        {!esEdicion && (
                            <div className="flex items-start gap-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl px-4 py-3">
                                <Info size={15} className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-purple-800 dark:text-purple-200 mb-0.5">
                                        🔢 Bitácoras que se generarán
                                    </p>
                                    <p className="text-xs text-purple-700 dark:text-purple-300 leading-relaxed">
                                        Al crear esta fase se generarán automáticamente 5 bitácoras
                                        con numeración continua. El rango exacto dependerá del
                                        orden final de las fases.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={processing}
                            className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl transition-colors">
                            <Save size={14} />
                            {processing ? 'Guardando...' : 'Guardar Fase'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
