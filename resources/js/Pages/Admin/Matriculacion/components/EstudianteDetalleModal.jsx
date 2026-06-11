import { useState, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import {
    X, CheckCircle, XCircle, Edit2, Trash2, Key,
    Loader2, User, BookOpen, Lock, ChevronLeft,
} from 'lucide-react';

import ConfirmDialog from '@/Components/UI/ConfirmDialog';

// ── Module-scope helpers ──────────────────────────────────────────────────────

const AVATAR_COLORS = [
    'bg-purple-500', 'bg-blue-500', 'bg-green-500',
    'bg-yellow-500', 'bg-red-500',  'bg-pink-500', 'bg-indigo-500',
];
const getAvatarColor  = (n = '') => AVATAR_COLORS[n.charCodeAt(0) % AVATAR_COLORS.length];
const getInitials     = (a = '', b = '') => ((a[0] || '') + (b[0] || '')).toUpperCase();

const SEXOS = [
    { value: 'masculino', label: 'Masculino' },
    { value: 'femenino',  label: 'Femenino' },
    { value: 'otro',      label: 'Otro' },
];

const inputCls = (err) =>
    `w-full px-3 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all
    ${err ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-gray-600'}`;

const labelCls = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5';

function SectionHeader({ icon: Icon, title }) {
    return (
        <div className="flex items-center gap-2 mb-4">
            <Icon size={14} className="text-purple-500 dark:text-purple-400 flex-shrink-0" />
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                {title}
            </span>
            <div className="flex-1 h-px bg-purple-100 dark:bg-purple-900/50" />
        </div>
    );
}

function FieldError({ error }) {
    if (!error) return null;
    return <p className="text-xs text-red-500 dark:text-red-400 mt-1">{error}</p>;
}

function DataItem({ label, value }) {
    return (
        <div className="flex flex-col">
            <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">
                {label}
            </span>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {value || '—'}
            </span>
        </div>
    );
}

const formatFecha = (d) => d
    ? new Date(d + 'T00:00:00').toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '—';

// ── Component ─────────────────────────────────────────────────────────────────

export default function EstudianteDetalleModal({
    isOpen, estudiante, cursos, docentes, periodoActivo, onClose,
}) {
    const [modeEditar,      setModeEditar]      = useState(false);
    const [pasoEliminar,    setPasoEliminar]    = useState(null); // null | 'paso1' | 'paso2'
    const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        nombres:            '',
        apellidos:          '',
        cedula:             '',
        sexo:               '',
        direccion:          '',
        email:              '',
        celular:            '',
        numero_matricula:   '',
        curso_id:           '',
        docente_id:         '',
        periodo_lectivo_id: periodoActivo?.id ?? '',
    });

    const populate = (est) => {
        if (!est) return;
        const curso = est.cursos?.[0];
        setData({
            nombres:            est.nombres          ?? '',
            apellidos:          est.apellidos         ?? '',
            cedula:             est.cedula            ?? '',
            sexo:               est.sexo              ?? '',
            direccion:          est.direccion          ?? '',
            email:              est.email             ?? '',
            celular:            est.celular            ?? '',
            numero_matricula:   est.numero_matricula   ?? '',
            curso_id:           curso?.id ? String(curso.id) : '',
            docente_id:         curso?.pivot?.docente_id ? String(curso.pivot.docente_id) : '',
            periodo_lectivo_id: periodoActivo?.id ?? '',
        });
    };

    useEffect(() => {
        if (!isOpen || !estudiante) return;
        populate(estudiante);
        setModeEditar(false);
        setPasoEliminar(null);
        setResetConfirmOpen(false);
    }, [isOpen, estudiante?.id]);

    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => {
            if (e.key !== 'Escape') return;
            if (pasoEliminar || resetConfirmOpen) return; // ConfirmDialog maneja su propio ESC
            if (modeEditar) { setModeEditar(false); populate(estudiante); return; }
            onClose();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, modeEditar, pasoEliminar, resetConfirmOpen, onClose]);

    if (!isOpen || !estudiante) return null;

    // Derived
    const curso         = estudiante.cursos?.[0];
    const docenteObj    = (docentes || []).find(d => d.id === curso?.pivot?.docente_id);
    const docenteNombre = docenteObj
        ? (docenteObj.nombres && docenteObj.apellidos
            ? `${docenteObj.nombres} ${docenteObj.apellidos}`
            : docenteObj.name)
        : '—';
    const nombreCompleto = estudiante.nombres && estudiante.apellidos
        ? `${estudiante.nombres} ${estudiante.apellidos}`
        : estudiante.name;
    const avatarColor = getAvatarColor(estudiante.nombres || estudiante.name || '');

    const docentesFiltrados = data.curso_id
        ? (docentes || []).filter(d =>
            d.cursos_docente?.some(c => c.id === parseInt(data.curso_id))
          )
        : (docentes || []);

    const submitEdit = (e) => {
        e.preventDefault();
        put(route('admin.matriculacion.update', estudiante.id), {
            onSuccess: () => setModeEditar(false),
            preserveScroll: true,
        });
    };

    const cancelEdit = () => {
        setModeEditar(false);
        populate(estudiante);
    };

    return (
        <>
            {/* ── Confirm dialogs (portal — z-index 9999) ── */}

            {/* Reset contraseña */}
            <ConfirmDialog
                open={resetConfirmOpen}
                titulo="¿Resetear contraseña?"
                mensaje={`La nueva contraseña será el número de cédula del estudiante: <strong>${estudiante.cedula}</strong>`}
                tipo="warning"
                labelConfirmar="Resetear contraseña"
                labelCancelar="Cancelar"
                onCancel={() => setResetConfirmOpen(false)}
                onConfirm={() => {
                    router.patch(route('admin.matriculacion.reset-password', estudiante.id), {}, {
                        onSuccess:      () => setResetConfirmOpen(false),
                        preserveScroll: true,
                    });
                }}
            />

            {/* Eliminar — paso 1 */}
            <ConfirmDialog
                open={pasoEliminar === 'paso1'}
                titulo="Eliminar estudiante"
                mensaje={`Esta acción eliminará permanentemente a <strong>${nombreCompleto}</strong> y TODOS sus datos: calificaciones, asistencias y bitácoras. <strong style="color:#ef4444">Esta acción NO se puede deshacer.</strong>`}
                tipo="warning"
                labelConfirmar="Continuar →"
                labelCancelar="Cancelar"
                onCancel={() => setPasoEliminar(null)}
                onConfirm={() => setPasoEliminar('paso2')}
            />

            {/* Eliminar — paso 2 */}
            <ConfirmDialog
                open={pasoEliminar === 'paso2'}
                titulo="Confirmación final"
                mensaje="Para eliminar permanentemente escribe el nombre del estudiante:"
                tipo="danger"
                labelConfirmar="Eliminar permanentemente"
                labelCancelar="← Volver"
                requireText={estudiante.nombres}
                onCancel={() => setPasoEliminar('paso1')}
                onConfirm={() => {
                    router.delete(route('admin.matriculacion.destroy', estudiante.id), {
                        onSuccess: () => {
                            setPasoEliminar(null);
                            onClose();
                        },
                        preserveScroll: true,
                    });
                }}
            />

            {/* ── Modal principal (z-50) ── */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="absolute inset-0 bg-black/60"
                    onClick={onClose}
                />

                <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-50">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-700 to-purple-900 px-6 py-5 rounded-t-2xl relative">
                        <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0 ring-2 ring-white/30 ${avatarColor}`}>
                                {getInitials(estudiante.nombres, estudiante.apellidos)}
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-white text-xl font-bold truncate">{nombreCompleto}</h2>
                                <p className="text-purple-200 text-sm">{estudiante.numero_matricula || 'Sin matrícula'}</p>
                                <span className={`inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium
                                    ${estudiante.estado === 'activo'
                                        ? 'bg-green-400/20 text-green-200'
                                        : 'bg-red-400/20 text-red-200'}`}>
                                    {estudiante.estado === 'activo'
                                        ? <><CheckCircle size={11} /> Activo</>
                                        : <><XCircle size={11} /> Inactivo</>}
                                </span>
                            </div>
                        </div>
                        {modeEditar && (
                            <span className="absolute top-4 right-12 px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-200 text-xs font-medium">
                                Editando
                            </span>
                        )}
                        <button onClick={onClose}
                            className="absolute top-4 right-4 p-1.5 text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/10">
                            <X size={18} />
                        </button>
                    </div>

                    {/* ── MODO VER ── */}
                    {!modeEditar && (
                        <>
                            <div className="p-6 space-y-6">

                                <div>
                                    <SectionHeader icon={User} title="Información Personal" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <DataItem label="👤 Nombres"   value={estudiante.nombres} />
                                        <DataItem label="👤 Apellidos" value={estudiante.apellidos} />
                                        <DataItem label="🪪 Cédula"    value={estudiante.cedula} />
                                        <DataItem label="📱 Celular"   value={estudiante.celular} />
                                        <DataItem label="⚥ Sexo"
                                            value={estudiante.sexo
                                                ? estudiante.sexo.charAt(0).toUpperCase() + estudiante.sexo.slice(1)
                                                : null} />
                                        <DataItem label="📍 Dirección" value={estudiante.direccion} />
                                    </div>
                                </div>

                                <div>
                                    <SectionHeader icon={BookOpen} title="Información Académica" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <DataItem label="🎓 Matrícula"       value={estudiante.numero_matricula} />
                                        <DataItem label="📚 Curso"           value={curso?.nombre} />
                                        <DataItem label="👨‍🏫 Docente"          value={docenteNombre} />
                                        <DataItem label="📅 Fecha Matrícula" value={formatFecha(curso?.pivot?.fecha_matricula)} />
                                    </div>
                                </div>

                                <div>
                                    <SectionHeader icon={Lock} title="Credenciales" />
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                                        <div className="space-y-1.5 mb-3">
                                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                                📧 <strong>Correo/Usuario:</strong> {estudiante.email}
                                            </p>
                                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                                🔑 <strong>Contraseña:</strong> ••••••••• (cédula)
                                            </p>
                                        </div>
                                        <button onClick={() => setResetConfirmOpen(true)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                                            <Key size={12} /> Resetear contraseña
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
                                <button
                                    type="button"
                                    onClick={() => setPasoEliminar('paso1')}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                    <Trash2 size={16} /> Eliminar estudiante
                                </button>
                                <button onClick={() => setModeEditar(true)}
                                    className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors">
                                    <Edit2 size={14} /> Editar datos
                                </button>
                            </div>
                        </>
                    )}

                    {/* ── MODO EDITAR ── */}
                    {modeEditar && (
                        <form onSubmit={submitEdit}>
                            <div className="p-6 space-y-6">

                                <div>
                                    <SectionHeader icon={User} title="Datos Personales" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelCls}>Nombres <span className="text-red-500">*</span></label>
                                            <input type="text" value={data.nombres}
                                                onChange={e => setData('nombres', e.target.value)}
                                                className={inputCls(errors.nombres)} />
                                            <FieldError error={errors.nombres} />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Apellidos <span className="text-red-500">*</span></label>
                                            <input type="text" value={data.apellidos}
                                                onChange={e => setData('apellidos', e.target.value)}
                                                className={inputCls(errors.apellidos)} />
                                            <FieldError error={errors.apellidos} />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Cédula <span className="text-red-500">*</span></label>
                                            <input type="text" value={data.cedula}
                                                inputMode="numeric"
                                                onChange={e => setData('cedula', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                maxLength={10}
                                                className={inputCls(errors.cedula)} />
                                            <FieldError error={errors.cedula} />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Sexo <span className="text-red-500">*</span></label>
                                            <select value={data.sexo}
                                                onChange={e => setData('sexo', e.target.value)}
                                                className={inputCls(errors.sexo)}>
                                                <option value="">Seleccionar...</option>
                                                {SEXOS.map(s => (
                                                    <option key={s.value} value={s.value}>{s.label}</option>
                                                ))}
                                            </select>
                                            <FieldError error={errors.sexo} />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Celular</label>
                                            <input type="tel" value={data.celular}
                                                onChange={e => setData('celular', e.target.value)}
                                                className={inputCls(errors.celular)} />
                                            <FieldError error={errors.celular} />
                                        </div>
                                        <div className="col-span-2">
                                            <label className={labelCls}>Dirección</label>
                                            <textarea rows={2} value={data.direccion}
                                                onChange={e => setData('direccion', e.target.value)}
                                                className={`${inputCls(errors.direccion)} resize-none`} />
                                            <FieldError error={errors.direccion} />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <SectionHeader icon={BookOpen} title="Información Académica" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelCls}>N.° Matrícula <span className="text-red-500">*</span></label>
                                            <input type="text" value={data.numero_matricula}
                                                onChange={e => setData('numero_matricula', e.target.value)}
                                                className={inputCls(errors.numero_matricula)} />
                                            <FieldError error={errors.numero_matricula} />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Curso <span className="text-red-500">*</span></label>
                                            <select value={data.curso_id}
                                                onChange={e => setData(prev => ({ ...prev, curso_id: e.target.value, docente_id: '' }))}
                                                className={inputCls(errors.curso_id)}>
                                                <option value="">Seleccionar...</option>
                                                {(cursos || []).map(c => (
                                                    <option key={c.id} value={String(c.id)}>{c.nombre}</option>
                                                ))}
                                            </select>
                                            <FieldError error={errors.curso_id} />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Docente <span className="text-red-500">*</span></label>
                                            <select value={data.docente_id}
                                                onChange={e => setData('docente_id', e.target.value)}
                                                disabled={!data.curso_id}
                                                className={inputCls(errors.docente_id)}>
                                                <option value="">Seleccionar...</option>
                                                {docentesFiltrados.map(d => (
                                                    <option key={d.id} value={String(d.id)}>
                                                        {d.nombres && d.apellidos
                                                            ? `${d.nombres} ${d.apellidos}`
                                                            : d.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <FieldError error={errors.docente_id} />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Correo electrónico <span className="text-red-500">*</span></label>
                                            <input type="email" value={data.email}
                                                onChange={e => setData('email', e.target.value)}
                                                className={inputCls(errors.email)} />
                                            <FieldError error={errors.email} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
                                <button type="button" onClick={cancelEdit} disabled={processing}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                    <ChevronLeft size={14} /> Cancelar edición
                                </button>
                                <button type="submit" disabled={processing}
                                    className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors disabled:opacity-60">
                                    {processing && <Loader2 size={14} className="animate-spin" />}
                                    💾 Guardar cambios
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
}
