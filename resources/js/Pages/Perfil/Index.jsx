import { useState, useRef, useEffect } from 'react';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import { createPortal } from 'react-dom';
import AdminLayout      from '@/Layouts/AdminLayout';
import DocenteLayout    from '@/Layouts/DocenteLayout';
import EstudianteLayout from '@/Layouts/EstudianteLayout';
import {
    UserCircle, Camera, Lock, Eye, EyeOff, Save, Key, Shield,
    Mail, Globe, Clock, AlertCircle, CheckCircle2, Circle,
} from 'lucide-react';

// ── Constantes de módulo ──────────────────────────────────────────────────────

const LAYOUTS = {
    admin:      AdminLayout,
    docente:    DocenteLayout,
    estudiante: EstudianteLayout,
};

const ROL_CONFIG = {
    admin:      { label: 'Coordinador', cls: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
    docente:    { label: 'Docente',     cls: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
    estudiante: { label: 'Estudiante',  cls: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
};

const BAR_COLOR  = { red: 'bg-red-500', yellow: 'bg-yellow-500', blue: 'bg-blue-500', green: 'bg-green-500' };
const TEXT_COLOR = {
    red:    'text-red-600 dark:text-red-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    blue:   'text-blue-600 dark:text-blue-400',
    green:  'text-green-600 dark:text-green-400',
};

const INPUT_CLS = (err) =>
    `w-full px-3 py-2.5 border rounded-xl bg-white dark:bg-gray-700
    text-sm text-gray-900 dark:text-gray-100
    focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition
    ${err ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`;

const LABEL_CLS = 'block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name) {
    return (name || '').split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase() || '?';
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' });
}

function timeAgo(dateStr) {
    if (!dateStr) return 'No registrado';
    const diff = Date.now() - new Date(dateStr);
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'Hace un momento';
    if (mins < 60) return `Hace ${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `Hace ${hrs}h`;
    return `Hace ${Math.floor(hrs / 24)}d`;
}

function fortaleza(pwd) {
    if (!pwd) return null;
    if (pwd.length < 6)  return { nivel: 'Débil',   color: 'red',    width: '25%' };
    if (pwd.length < 10) return { nivel: 'Regular', color: 'yellow', width: '50%' };
    if (!/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd)) return { nivel: 'Buena', color: 'blue', width: '75%' };
    return { nivel: 'Fuerte', color: 'green', width: '100%' };
}

// ── Componentes reutilizables ─────────────────────────────────────────────────

function FlashToast({ flash }) {
    const [visible, setVisible] = useState(false);
    const [msg,     setMsg]     = useState('');
    const [tipo,    setTipo]    = useState('success');

    useEffect(() => {
        const text = flash?.success ?? flash?.error ?? null;
        if (text) {
            setMsg(text); setTipo(flash?.success ? 'success' : 'error'); setVisible(true);
            const t = setTimeout(() => setVisible(false), 4500);
            return () => clearTimeout(t);
        }
    }, [flash?.success, flash?.error]);

    if (!visible) return null;
    const cls = tipo === 'success'
        ? 'bg-green-100 dark:bg-green-900/40 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200'
        : 'bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200';
    return createPortal(
        <div className={`fixed top-5 right-5 z-50 border rounded-xl px-4 py-3 text-sm font-medium shadow-lg max-w-sm ${cls}`}>
            {msg}
        </div>,
        document.body
    );
}

function PasswordInput({ label, value, onChange, error, inputExtra }) {
    const [visible, setVisible] = useState(false);
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
            <div className="relative">
                <input
                    type={visible ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    className={`w-full px-3 py-2.5 pr-10 border rounded-xl
                        bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm
                        focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition
                        ${inputExtra ?? (error ? 'border-red-400' : 'border-gray-300 dark:border-gray-600')}`}
                />
                <button type="button" onClick={() => setVisible(!visible)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    {visible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}

function CheckItem({ ok, text }) {
    return (
        <div className="flex items-center gap-2">
            {ok
                ? <CheckCircle2 size={13} className="text-green-500 flex-shrink-0" />
                : <Circle       size={13} className="text-gray-400 flex-shrink-0" />
            }
            <span className={`text-xs ${ok ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {text}
            </span>
        </div>
    );
}

function InfoRow({ icon, text }) {
    return (
        <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="text-base flex-shrink-0 leading-tight">{icon}</span>
            <span className="leading-snug">{text}</span>
        </div>
    );
}

function ReadonlyField({ label, value }) {
    return (
        <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{value || '—'}</p>
        </div>
    );
}

// ── PerfilCard — columna izquierda ────────────────────────────────────────────

function PerfilCard({ usuario, rol, onFotoChange, uploadingFoto }) {
    const fileRef = useRef(null);
    const rolCfg  = ROL_CONFIG[rol] || ROL_CONFIG.admin;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center gap-4 lg:sticky lg:top-4">
            {/* Avatar con botón cámara */}
            <div className="relative">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-purple-200 dark:border-purple-800">
                    {usuario.foto
                        ? <img src={usuario.foto_url} alt={usuario.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-purple-600 flex items-center justify-center">
                            <span className="text-white text-3xl font-bold select-none">
                                {getInitials(usuario.nombre_completo || usuario.name)}
                            </span>
                          </div>
                    }
                </div>
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploadingFoto}
                    className="absolute bottom-0 right-0 p-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white rounded-full transition-colors shadow-lg">
                    {uploadingFoto
                        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <Camera size={14} />
                    }
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFotoChange} />
            </div>

            {/* Nombre + badge + email */}
            <div className="text-center space-y-1.5">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">
                    {usuario.nombre_completo || usuario.name}
                </h2>
                <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-semibold ${rolCfg.cls}`}>
                    {rolCfg.label}
                </span>
                <p className="text-sm text-gray-500 dark:text-gray-400 break-all">{usuario.email}</p>
            </div>

            {/* Info adicional según rol */}
            <div className="w-full border-t border-gray-100 dark:border-gray-700 pt-4 space-y-2.5">
                {rol === 'admin' && (<>
                    <InfoRow icon="🛡️" text="Coordinador del Sistema" />
                    <InfoRow icon="📅" text={`Miembro desde: ${formatDate(usuario.created_at)}`} />
                </>)}
                {rol === 'docente' && (<>
                    <InfoRow icon="👨‍🏫" text="Docente" />
                    {usuario.cursos_asignados?.length > 0 &&
                        <InfoRow icon="📚" text={`Cursos: ${usuario.cursos_asignados.join(', ')}`} />}
                    <InfoRow icon="📅" text={`Miembro desde: ${formatDate(usuario.created_at)}`} />
                </>)}
                {rol === 'estudiante' && (<>
                    {usuario.curso &&
                        <InfoRow icon="🎓" text={usuario.curso.curso} />}
                    {usuario.docente &&
                        <InfoRow icon="👨‍🏫" text={`Docente: ${usuario.docente.nombres} ${usuario.docente.apellidos}`} />}
                    {usuario.numero_matricula &&
                        <InfoRow icon="🪪" text={`Matrícula: ${usuario.numero_matricula}`} />}
                    <InfoRow icon="📅" text={`Desde: ${formatDate(usuario.created_at)}`} />
                </>)}
            </div>
        </div>
    );
}

// ── Tab 1 — Datos Personales ──────────────────────────────────────────────────

function TabDatos({ usuario, rol }) {
    const { data, setData, put, processing, errors } = useForm({
        nombres:   usuario.nombres   || '',
        apellidos: usuario.apellidos || '',
        email:     usuario.email     || '',
        celular:   usuario.celular   || '',
        direccion: usuario.direccion || '',
    });

    useEffect(() => {
        setData({
            nombres:   usuario.nombres   || '',
            apellidos: usuario.apellidos || '',
            email:     usuario.email     || '',
            celular:   usuario.celular   || '',
            direccion: usuario.direccion || '',
        });
    }, [usuario.nombres, usuario.apellidos, usuario.email, usuario.celular, usuario.direccion]);

    const submit = (e) => {
        e.preventDefault();
        put(route('perfil.update'), { preserveScroll: true });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            {/* Información Personal */}
            <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                    <UserCircle size={16} className="text-purple-600 dark:text-purple-400" />
                    Información Personal
                </h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={LABEL_CLS}>Nombres <span className="text-red-500">*</span></label>
                            <input type="text" value={data.nombres}
                                onChange={e => setData('nombres', e.target.value)}
                                className={INPUT_CLS(errors.nombres)} />
                            {errors.nombres && <p className="text-red-500 text-xs mt-1">{errors.nombres}</p>}
                        </div>
                        <div>
                            <label className={LABEL_CLS}>Apellidos <span className="text-red-500">*</span></label>
                            <input type="text" value={data.apellidos}
                                onChange={e => setData('apellidos', e.target.value)}
                                className={INPUT_CLS(errors.apellidos)} />
                            {errors.apellidos && <p className="text-red-500 text-xs mt-1">{errors.apellidos}</p>}
                        </div>
                    </div>
                    <div>
                        <label className={LABEL_CLS}>Email <span className="text-red-500">*</span></label>
                        <input type="email" value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            className={INPUT_CLS(errors.email)} />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={LABEL_CLS}>Celular</label>
                            <input type="text" value={data.celular}
                                onChange={e => setData('celular', e.target.value)}
                                placeholder="0999000000"
                                className={INPUT_CLS(false)} />
                        </div>
                        <div>
                            <label className={LABEL_CLS}>Dirección</label>
                            <input type="text" value={data.direccion}
                                onChange={e => setData('direccion', e.target.value)}
                                placeholder="Calle, ciudad..."
                                className={INPUT_CLS(false)} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sección académica readonly — solo estudiante */}
            {rol === 'estudiante' && (
                <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                        <Lock size={16} className="text-gray-500" /> Información Académica
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <ReadonlyField label="Cédula"  value={usuario.cedula} />
                            <ReadonlyField label="Curso"   value={usuario.curso?.curso} />
                        </div>
                        <ReadonlyField label="Matrícula" value={usuario.numero_matricula} />
                        <div className="flex items-start gap-2 p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
                            <AlertCircle size={14} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-700 dark:text-amber-300">
                                Estos datos solo pueden ser modificados por el Coordinador
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-end border-t border-gray-100 dark:border-gray-700 pt-4">
                <button type="submit" disabled={processing}
                    className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors">
                    <Save size={15} />
                    {processing ? 'Guardando...' : 'Guardar cambios'}
                </button>
            </div>
        </form>
    );
}

// ── Tab 2 — Seguridad ─────────────────────────────────────────────────────────

function TabSeguridad({ usuario }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        password_actual:             '',
        password_nuevo:              '',
        password_nuevo_confirmation: '',
    });

    const fort       = fortaleza(data.password_nuevo);
    const checks     = {
        length:    data.password_nuevo.length >= 8,
        uppercase: /[A-Z]/.test(data.password_nuevo),
        number:    /[0-9]/.test(data.password_nuevo),
    };
    const allOk      = checks.length && checks.uppercase && checks.number;
    const coincide   = data.password_nuevo.length > 0 && data.password_nuevo === data.password_nuevo_confirmation;
    const noCoincide = data.password_nuevo_confirmation.length > 0 && !coincide;

    const confirmBorder = noCoincide
        ? 'border-red-400'
        : coincide ? 'border-green-400' : undefined;

    const submit = (e) => {
        e.preventDefault();
        put(route('perfil.password'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <div className="space-y-6">
            {/* Cambiar contraseña */}
            <div className="border-l-4 border-purple-500 pl-5">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                    <Key size={16} className="text-purple-600 dark:text-purple-400" /> Cambiar Contraseña
                </h3>
                <form onSubmit={submit} className="space-y-4">
                    <PasswordInput
                        label="Contraseña actual *"
                        value={data.password_actual}
                        onChange={e => setData('password_actual', e.target.value)}
                        error={errors.password_actual}
                    />

                    <div>
                        <PasswordInput
                            label="Nueva contraseña *"
                            value={data.password_nuevo}
                            onChange={e => setData('password_nuevo', e.target.value)}
                            error={errors.password_nuevo}
                        />
                        {data.password_nuevo && fort && (
                            <div className="mt-2 space-y-1">
                                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all ${BAR_COLOR[fort.color]}`}
                                        style={{ width: fort.width }} />
                                </div>
                                <p className={`text-xs ${TEXT_COLOR[fort.color]}`}>Fortaleza: {fort.nivel}</p>
                            </div>
                        )}
                    </div>

                    <div>
                        <PasswordInput
                            label="Confirmar contraseña *"
                            value={data.password_nuevo_confirmation}
                            onChange={e => setData('password_nuevo_confirmation', e.target.value)}
                            inputExtra={confirmBorder}
                        />
                        {noCoincide && <p className="text-red-500 text-xs mt-1">Las contraseñas no coinciden</p>}
                        {coincide   && <p className="text-green-500 text-xs mt-1">Las contraseñas coinciden ✓</p>}
                    </div>

                    {/* Requisitos */}
                    <div className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-3.5 space-y-2">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Requisitos:</p>
                        <CheckItem ok={checks.length}    text="Al menos 8 caracteres" />
                        <CheckItem ok={checks.uppercase} text="Al menos una mayúscula" />
                        <CheckItem ok={checks.number}    text="Al menos un número" />
                    </div>

                    <div className="flex justify-end border-t border-gray-100 dark:border-gray-700 pt-4">
                        <button type="submit" disabled={processing || !allOk || !coincide}
                            className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors">
                            <Lock size={15} />
                            {processing ? 'Cambiando...' : 'Cambiar contraseña'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Información de acceso (readonly) */}
            <div className="bg-gray-50 dark:bg-gray-700/40 rounded-xl border border-gray-200 dark:border-gray-600 p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                    <Shield size={15} className="text-gray-500" /> Información de acceso
                </h3>
                {[
                    { Icon: Mail,  label: 'Usuario de acceso', val: usuario.email },
                    { Icon: Clock, label: 'Último acceso',     val: timeAgo(usuario.last_login_at) },
                    { Icon: Globe, label: 'Última IP',         val: usuario.last_login_ip || '—' },
                ].map(({ Icon, label, val }) => (
                    <div key={label} className="flex items-center gap-3 text-sm">
                        <Icon size={14} className="text-gray-400 flex-shrink-0" />
                        <span className="text-gray-500 dark:text-gray-400 w-36 flex-shrink-0">{label}:</span>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{val}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Contenido de la página ────────────────────────────────────────────────────

const TABS = [
    { id: 'datos',     label: 'Datos Personales', icon: '👤' },
    { id: 'seguridad', label: 'Seguridad',         icon: '🔒' },
];

function PerfilContent({ usuario, rol }) {
    const [tab,           setTab]       = useState('datos');
    const [uploadingFoto, setUploading] = useState(false);

    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        const fd = new FormData();
        fd.append('foto', file);
        router.post(route('perfil.foto'), fd, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => setUploading(false),
        });
    };

    return (
        <div className="max-w-screen-lg mx-auto px-4 sm:px-6 py-6">
            {/* Page header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mi Perfil</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Administra tu información personal y contraseña
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna izquierda */}
                <div className="lg:col-span-1">
                    <PerfilCard
                        usuario={usuario}
                        rol={rol}
                        onFotoChange={handleFotoChange}
                        uploadingFoto={uploadingFoto}
                    />
                </div>

                {/* Columna derecha */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {/* Tabs */}
                        <div className="flex border-b border-gray-200 dark:border-gray-700 px-5 pt-1 gap-1">
                            {TABS.map(t => (
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

                        {/* Contenido del tab */}
                        <div className="p-6">
                            {tab === 'datos'     && <TabDatos     usuario={usuario} rol={rol} />}
                            {tab === 'seguridad' && <TabSeguridad usuario={usuario} />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function PerfilIndex({ usuario, rol }) {
    const Layout  = LAYOUTS[rol] || AdminLayout;
    const { props } = usePage();

    return (
        <Layout>
            <Head title="Mi Perfil" />
            <FlashToast flash={props.flash} />
            <PerfilContent usuario={usuario} rol={rol} />
        </Layout>
    );
}
