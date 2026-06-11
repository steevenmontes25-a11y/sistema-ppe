import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { X, BookOpen, Loader2 } from 'lucide-react';

const TIPOS = [
    { value: 'pdf',   label: 'PDF',   icon: '📄', desc: 'Documento PDF' },
    { value: 'foto',  label: 'Foto',  icon: '📷', desc: 'Imagen/Foto'   },
    { value: 'texto', label: 'Texto', icon: '📝', desc: 'Texto libre'   },
    { value: 'mixto', label: 'Mixto', icon: '📎', desc: 'PDF + Foto'    },
];

const ESTADOS = [
    { value: 'borrador', label: 'Borrador' },
    { value: 'activa',   label: 'Activa' },
    { value: 'cerrada',  label: 'Cerrada' },
];

const toDateInput = (v) => (v ? String(v).split('T')[0] : '');
const formatDate  = (d) => d
    ? new Date(d + 'T00:00:00').toLocaleDateString('es-EC', { day: '2-digit', month: 'short' })
    : '';

const inputCls = (err) =>
    `w-full px-3 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all ${err ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-gray-600'}`;

const labelCls = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5';

function SectionHeader({ title }) {
    return (
        <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                {title}
            </span>
            <div className="flex-1 h-px bg-purple-100 dark:bg-purple-900/50" />
        </div>
    );
}

export default function ActividadModal({ isOpen, actividad, fases, cursos, onClose, fechaPreseleccionada }) {
    const isEditing = !!actividad;

    const [cursoId, setCursoId] = useState('');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        titulo:             '',
        descripcion:        '',
        fase_ppe_id:        '',
        fecha_inicio:       '',
        fecha_entrega:      '',
        fecha_finalizacion: '',
        tipo_entrega:       'pdf',
        puntaje_maximo:     10,
        estado:             'borrador',
    });

    useEffect(() => {
        if (!isOpen) return;
        if (actividad) {
            setCursoId(String(actividad.curso_id || ''));
            setData({
                titulo:             actividad.titulo             ?? '',
                descripcion:        actividad.descripcion        ?? '',
                fase_ppe_id:        actividad.fase_ppe_id        ?? '',
                fecha_inicio:       toDateInput(actividad.fecha_inicio),
                fecha_entrega:      toDateInput(actividad.fecha_entrega),
                fecha_finalizacion: toDateInput(actividad.fecha_finalizacion),
                tipo_entrega:       actividad.tipo_entrega       ?? 'pdf',
                puntaje_maximo:     actividad.puntaje_maximo     ?? 10,
                estado:             actividad.estado             ?? 'borrador',
            });
        } else {
            setCursoId('');
            reset();
            if (fechaPreseleccionada) setData('fecha_entrega', fechaPreseleccionada);
        }
    }, [isOpen, actividad]);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const fasesFiltradas = cursoId
        ? fases.filter(f => String(f.curso_id) === cursoId)
        : fases;

    const tieneFechas = data.fecha_inicio && data.fecha_entrega && data.fecha_finalizacion;

    const submit = (e) => {
        e.preventDefault();
        const opts = { onSuccess: () => { reset(); onClose(); }, preserveScroll: true };
        if (isEditing) {
            put(route('admin.cronograma.update', actividad.id), opts);
        } else {
            post(route('admin.cronograma.store'), opts);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">

                {/* Header degradado morado */}
                <div className="bg-gradient-to-r from-purple-700 to-purple-900 px-6 py-5 rounded-t-2xl relative">
                    <div className="flex items-center gap-3">
                        <BookOpen size={24} className="text-white flex-shrink-0" />
                        <div>
                            <h2 className="text-white text-xl font-bold">
                                {isEditing ? 'Editar Actividad' : 'Nueva Actividad'}
                            </h2>
                            <p className="text-purple-200 text-sm mt-0.5">
                                Complete los datos de la actividad académica
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="absolute top-4 right-4 p-1.5 text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/10">
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={submit}>
                    <div className="p-6 space-y-6">

                        {/* ── Sección 1: Información General ── */}
                        <div>
                            <SectionHeader title="Información General" />
                            <div className="space-y-4">
                                <div>
                                    <label className={labelCls}>
                                        Título de la actividad <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.titulo}
                                        onChange={e => setData('titulo', e.target.value)}
                                        placeholder="Ej: Informe de Diagnóstico Comunitario"
                                        className={inputCls(errors.titulo)}
                                    />
                                    {errors.titulo && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.titulo}</p>}
                                </div>
                                <div>
                                    <label className={labelCls}>Descripción</label>
                                    <textarea
                                        rows={3}
                                        value={data.descripcion}
                                        onChange={e => setData('descripcion', e.target.value)}
                                        placeholder="Descripción opcional de la actividad..."
                                        className={`${inputCls(errors.descripcion)} resize-none`}
                                    />
                                    {errors.descripcion && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.descripcion}</p>}
                                </div>
                            </div>
                        </div>

                        {/* ── Sección 2: Asignación ── */}
                        <div>
                            <SectionHeader title="Asignación" />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Curso</label>
                                    <select
                                        value={cursoId}
                                        onChange={e => { setCursoId(e.target.value); setData('fase_ppe_id', ''); }}
                                        className={inputCls(false)}
                                    >
                                        <option value="">Todos los cursos</option>
                                        {(cursos || []).map(c => (
                                            <option key={c.id} value={String(c.id)}>{c.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>
                                        Fase PPE <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.fase_ppe_id}
                                        onChange={e => setData('fase_ppe_id', e.target.value)}
                                        disabled={cursoId !== '' && fasesFiltradas.length === 0}
                                        className={inputCls(errors.fase_ppe_id)}
                                    >
                                        <option value="">
                                            {cursoId && fasesFiltradas.length === 0
                                                ? 'Sin fases para este curso'
                                                : 'Seleccionar fase...'}
                                        </option>
                                        {fasesFiltradas.map(f => (
                                            <option key={f.id} value={f.id}>
                                                {f.nombre}{f.curso ? ` — ${f.curso.nombre}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {cursoId && fasesFiltradas.length === 0 && (
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                            No hay fases para este curso
                                        </p>
                                    )}
                                    {errors.fase_ppe_id && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.fase_ppe_id}</p>}
                                </div>
                            </div>
                        </div>

                        {/* ── Sección 3: Fechas ── */}
                        <div>
                            <SectionHeader title="Fechas" />
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className={labelCls}>Inicio <span className="text-red-500">*</span></label>
                                    <input type="date" value={data.fecha_inicio}
                                        onChange={e => setData('fecha_inicio', e.target.value)}
                                        className={inputCls(errors.fecha_inicio)} />
                                    {errors.fecha_inicio && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.fecha_inicio}</p>}
                                </div>
                                <div>
                                    <label className={labelCls}>Entrega <span className="text-red-500">*</span></label>
                                    <input type="date" value={data.fecha_entrega}
                                        onChange={e => setData('fecha_entrega', e.target.value)}
                                        className={inputCls(errors.fecha_entrega)} />
                                    {errors.fecha_entrega && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.fecha_entrega}</p>}
                                </div>
                                <div>
                                    <label className={labelCls}>Finalización <span className="text-red-500">*</span></label>
                                    <input type="date" value={data.fecha_finalizacion}
                                        onChange={e => setData('fecha_finalizacion', e.target.value)}
                                        className={inputCls(errors.fecha_finalizacion)} />
                                    {errors.fecha_finalizacion && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.fecha_finalizacion}</p>}
                                </div>
                            </div>

                            {/* Timeline visual de fechas */}
                            {tieneFechas && (
                                <div className="mt-4 flex items-start">
                                    <div className="flex flex-col items-center">
                                        <div className="w-3 h-3 rounded-full bg-purple-600 mt-0.5" />
                                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 whitespace-nowrap">
                                            {formatDate(data.fecha_inicio)}
                                        </span>
                                    </div>
                                    <div className="flex-1 h-0.5 bg-purple-300 dark:bg-purple-700 mt-[7px]" />
                                    <div className="flex flex-col items-center">
                                        <div className="w-3 h-3 rounded-full bg-purple-600 mt-0.5" />
                                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 whitespace-nowrap">
                                            {formatDate(data.fecha_entrega)}
                                        </span>
                                    </div>
                                    <div className="flex-1 h-0.5 bg-purple-300 dark:bg-purple-700 mt-[7px]" />
                                    <div className="flex flex-col items-center">
                                        <div className="w-3 h-3 rounded-full bg-purple-600 mt-0.5" />
                                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 whitespace-nowrap">
                                            {formatDate(data.fecha_finalizacion)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── Sección 4: Configuración de Entrega ── */}
                        <div>
                            <SectionHeader title="Configuración de Entrega" />

                            <div className="mb-4">
                                <label className={labelCls}>
                                    Tipo de entrega <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {TIPOS.map(t => (
                                        <button key={t.value} type="button"
                                            onClick={() => setData('tipo_entrega', t.value)}
                                            className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all cursor-pointer text-center
                                                ${data.tipo_entrega === t.value
                                                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/30'
                                                    : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 bg-white dark:bg-gray-700'
                                                }`}>
                                            <span className="text-2xl mb-1">{t.icon}</span>
                                            <span className={`text-xs font-semibold ${data.tipo_entrega === t.value ? 'text-purple-700 dark:text-purple-300' : 'text-gray-600 dark:text-gray-400'}`}>
                                                {t.label}
                                            </span>
                                            <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{t.desc}</span>
                                        </button>
                                    ))}
                                </div>
                                {errors.tipo_entrega && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.tipo_entrega}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>
                                        Puntaje máximo <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="1"
                                            max="10"
                                            step="0.5"
                                            value={data.puntaje_maximo}
                                            onChange={e => setData('puntaje_maximo', e.target.value)}
                                            className={`${inputCls(errors.puntaje_maximo)} pr-10`}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-gray-500 pointer-events-none">
                                            /10
                                        </span>
                                    </div>
                                    {errors.puntaje_maximo && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.puntaje_maximo}</p>}
                                </div>
                                <div>
                                    <label className={labelCls}>
                                        Estado <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.estado}
                                        onChange={e => setData('estado', e.target.value)}
                                        className={inputCls(errors.estado)}
                                    >
                                        {ESTADOS.map(({ value, label }) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                    {errors.estado && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.estado}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
                        <button type="button" onClick={onClose} disabled={processing}
                            className="px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={processing}
                            className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors disabled:opacity-60">
                            {processing && <Loader2 size={14} className="animate-spin" />}
                            💾 {isEditing ? 'Guardar cambios' : 'Guardar Actividad'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
