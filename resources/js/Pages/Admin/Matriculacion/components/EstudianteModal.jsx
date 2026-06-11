import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import {
    X, UserPlus, BookOpen, Lock, Loader2, AlertCircle, Info,
    User, CreditCard, Phone, Users, MapPin, Mail,
} from 'lucide-react';

// ── Module-scope constants ────────────────────────────────────────────────────

const SEXOS = [
    { value: 'masculino', label: 'Masculino' },
    { value: 'femenino',  label: 'Femenino' },
    { value: 'otro',      label: 'Otro' },
];

const inputCls = (err) =>
    `w-full px-3 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all
    ${err ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-gray-600'}`;

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

function FieldLabel({ icon: Icon, children }) {
    return (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            <span className="flex items-center gap-1.5">
                {Icon && <Icon size={13} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />}
                {children}
            </span>
        </label>
    );
}

function FieldError({ error }) {
    if (!error) return null;
    return <p className="text-xs text-red-500 dark:text-red-400 mt-1">{error}</p>;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function EstudianteModal({
    isOpen, cursos, docentes, periodoActivo, stats, onClose,
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
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

    useEffect(() => {
        if (!isOpen) return;
        reset();
        setData('periodo_lectivo_id', periodoActivo?.id ?? '');
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const docentesFiltrados = data.curso_id
        ? (docentes || []).filter(d =>
            d.cursos_docente?.some(c => c.id === parseInt(data.curso_id))
          )
        : (docentes || []);

    const autoGenerarMatricula = () => {
        const year = new Date().getFullYear();
        const next = (stats?.total || 0) + 1;
        setData('numero_matricula', `PPE-${year}-${String(next).padStart(3, '0')}`);
    };

    // Cédula visual validation
    const cedulaLen = data.cedula.length;
    const cedulaBorder = cedulaLen === 0
        ? 'border-gray-200 dark:border-gray-600'
        : cedulaLen === 10 ? 'border-green-400 dark:border-green-500'
        : 'border-red-400 dark:border-red-500';
    const cedulaInputCls = `w-full px-3 py-2.5 border ${cedulaBorder} rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all`;

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.matriculacion.store'), {
            onSuccess: () => { reset(); onClose(); },
            preserveScroll: true,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">

                {/* Header */}
                <div className="bg-gradient-to-r from-purple-700 to-purple-900 px-6 py-5 rounded-t-2xl relative">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-xl flex-shrink-0">
                            <UserPlus size={22} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-white text-xl font-bold">Matricular Nuevo Estudiante</h2>
                            <p className="text-purple-200 text-sm mt-0.5">
                                Complete los datos para registrar al estudiante en el sistema
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="absolute top-4 right-4 p-1.5 text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/10">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={submit}>
                    <div className="p-6 space-y-6">

                        {/* ── Sección 1: Datos Personales ── */}
                        <div>
                            <SectionHeader icon={User} title="Datos Personales" />
                            <div className="grid grid-cols-2 gap-4">

                                <div>
                                    <FieldLabel icon={User}>Nombres <span className="text-red-500">*</span></FieldLabel>
                                    <input type="text" value={data.nombres}
                                        onChange={e => setData('nombres', e.target.value)}
                                        placeholder="Ej: Ana Lucía"
                                        className={inputCls(errors.nombres)} />
                                    <FieldError error={errors.nombres} />
                                </div>

                                <div>
                                    <FieldLabel icon={User}>Apellidos <span className="text-red-500">*</span></FieldLabel>
                                    <input type="text" value={data.apellidos}
                                        onChange={e => setData('apellidos', e.target.value)}
                                        placeholder="Ej: Torres Moreno"
                                        className={inputCls(errors.apellidos)} />
                                    <FieldError error={errors.apellidos} />
                                </div>

                                <div>
                                    <FieldLabel icon={CreditCard}>Cédula de identidad <span className="text-red-500">*</span></FieldLabel>
                                    <input type="text" value={data.cedula}
                                        inputMode="numeric"
                                        onChange={e => setData('cedula', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        placeholder="10 dígitos"
                                        maxLength={10}
                                        className={errors.cedula ? inputCls(errors.cedula) : cedulaInputCls} />
                                    {!errors.cedula && (
                                        <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 flex items-center gap-1">
                                            <Lock size={11} /> Será la contraseña inicial del estudiante
                                        </p>
                                    )}
                                    <FieldError error={errors.cedula} />
                                </div>

                                <div>
                                    <FieldLabel icon={Users}>Sexo <span className="text-red-500">*</span></FieldLabel>
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
                                    <FieldLabel icon={Phone}>Celular</FieldLabel>
                                    <input type="tel" value={data.celular}
                                        onChange={e => setData('celular', e.target.value)}
                                        placeholder="0991234567"
                                        className={inputCls(errors.celular)} />
                                    <FieldError error={errors.celular} />
                                </div>

                                <div className="col-span-2">
                                    <FieldLabel icon={MapPin}>Dirección</FieldLabel>
                                    <textarea rows={2} value={data.direccion}
                                        onChange={e => setData('direccion', e.target.value)}
                                        placeholder="Dirección domiciliaria..."
                                        className={`${inputCls(errors.direccion)} resize-none`} />
                                    <FieldError error={errors.direccion} />
                                </div>
                            </div>
                        </div>

                        {/* ── Sección 2: Información Académica ── */}
                        <div>
                            <SectionHeader icon={BookOpen} title="Información Académica" />
                            <div className="grid grid-cols-2 gap-4">

                                <div>
                                    <FieldLabel>Número de matrícula <span className="text-red-500">*</span></FieldLabel>
                                    <div className="flex gap-2">
                                        <input type="text" value={data.numero_matricula}
                                            onChange={e => setData('numero_matricula', e.target.value)}
                                            placeholder="PPE-2026-001"
                                            className={`${inputCls(errors.numero_matricula)} flex-1`} />
                                        <button type="button" onClick={autoGenerarMatricula}
                                            className="px-2.5 py-2 text-xs font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900 transition-colors whitespace-nowrap">
                                            ⚡ Auto
                                        </button>
                                    </div>
                                    <FieldError error={errors.numero_matricula} />
                                </div>

                                <div>
                                    <FieldLabel icon={BookOpen}>Curso <span className="text-red-500">*</span></FieldLabel>
                                    <select value={data.curso_id}
                                        onChange={e => setData(prev => ({ ...prev, curso_id: e.target.value, docente_id: '' }))}
                                        className={inputCls(errors.curso_id)}>
                                        <option value="">Seleccionar curso...</option>
                                        {(cursos || []).map(c => (
                                            <option key={c.id} value={String(c.id)}>
                                                {c.nombre} — Paralelo {c.paralelo}
                                            </option>
                                        ))}
                                    </select>
                                    <FieldError error={errors.curso_id} />
                                </div>

                                <div>
                                    <FieldLabel>Docente asignado <span className="text-red-500">*</span></FieldLabel>
                                    {data.curso_id && docentesFiltrados.length === 0 ? (
                                        <div className="flex items-center gap-2 px-3 py-2.5 border border-yellow-300 dark:border-yellow-600 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-xs text-yellow-700 dark:text-yellow-400">
                                            <AlertCircle size={14} />
                                            No hay docentes asignados a este curso
                                        </div>
                                    ) : (
                                        <select value={data.docente_id}
                                            onChange={e => setData('docente_id', e.target.value)}
                                            disabled={!data.curso_id}
                                            className={inputCls(errors.docente_id)}>
                                            <option value="">
                                                {data.curso_id ? 'Seleccionar docente...' : 'Selecciona primero un curso'}
                                            </option>
                                            {docentesFiltrados.map(d => (
                                                <option key={d.id} value={String(d.id)}>
                                                    {d.nombres && d.apellidos
                                                        ? `${d.nombres} ${d.apellidos}`
                                                        : d.name}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                    <FieldError error={errors.docente_id} />
                                </div>

                                <div>
                                    <FieldLabel>Período lectivo</FieldLabel>
                                    <input type="text"
                                        value={periodoActivo?.nombre ?? 'Sin período activo'}
                                        disabled
                                        className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-sm cursor-not-allowed" />
                                </div>
                            </div>
                        </div>

                        {/* ── Sección 3: Acceso al Sistema ── */}
                        <div>
                            <SectionHeader icon={Lock} title="Acceso al Sistema" />

                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex-shrink-0">
                                        <Info size={20} className="text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
                                            Credenciales de acceso automáticas
                                        </p>
                                        <div className="space-y-1">
                                            <p className="text-xs text-blue-700 dark:text-blue-400">
                                                📧 <strong>Usuario:</strong> correo electrónico ingresado
                                            </p>
                                            <p className="text-xs text-blue-700 dark:text-blue-400">
                                                🔑 <strong>Contraseña inicial:</strong> número de cédula
                                            </p>
                                            <p className="text-xs text-blue-500 dark:text-blue-500 mt-2 italic">
                                                El estudiante puede cambiar su contraseña desde "Mi Perfil"
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <FieldLabel icon={Mail}>
                                    Correo electrónico (usuario de acceso) <span className="text-red-500">*</span>
                                </FieldLabel>
                                <input type="email" value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    placeholder="estudiante@ppe.edu"
                                    className={inputCls(errors.email)} />
                                <FieldError error={errors.email} />
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
                            Matricular Estudiante
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
