import { useState, useEffect, useMemo } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { createPortal } from 'react-dom';
import { Plus, Shield, Search, Key, Power, Users, UserCheck, AlertTriangle } from 'lucide-react';
import AdminLayout  from '@/Layouts/AdminLayout';
import UsuarioModal from './components/UsuarioModal';

// ── Utilidades ────────────────────────────────────────────────────────────────

const timeAgo = (date) => {
    if (!date) return 'Nunca';
    const diff = Date.now() - new Date(date);
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'Hace un momento';
    if (mins < 60) return `hace ${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `hace ${hrs}h`;
    return `hace ${Math.floor(hrs / 24)}d`;
};

const ROL_CONFIG = {
    admin:   { label: 'Admin',   cls: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400' },
    docente: { label: 'Docente', cls: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' },
};

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color }) {
    const colors = {
        purple: 'border-l-purple-500 bg-purple-50 dark:bg-purple-900/10',
        red:    'border-l-red-500    bg-red-50    dark:bg-red-900/10',
        blue:   'border-l-blue-500   bg-blue-50   dark:bg-blue-900/10',
    };
    return (
        <div className={`rounded-xl border border-gray-200 dark:border-gray-700 border-l-4 p-4 ${colors[color]}`}>
            <div className="flex items-center gap-3">
                <Icon size={18} className="text-gray-400 dark:text-gray-500" />
                <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                </div>
            </div>
        </div>
    );
}

// ── ConfirmDialog ─────────────────────────────────────────────────────────────

function ConfirmDialog({ isOpen, titulo, mensaje, labelConfirmar, colorBtn, onConfirmar, onCancelar }) {
    if (!isOpen) return null;
    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 10001 }}>
            <div className="absolute inset-0 bg-black/60" onClick={onCancelar} />
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6"
                style={{ zIndex: 10002 }} onClick={e => e.stopPropagation()}>
                <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100">{titulo}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{mensaje}</p>
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <button onClick={onCancelar}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={onConfirmar}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-xl transition-colors ${colorBtn}`}>
                        {labelConfirmar}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

// ── Flash toast ───────────────────────────────────────────────────────────────

function FlashToast({ flash }) {
    const [visible, setVisible] = useState(false);
    const [msg,     setMsg]     = useState('');
    const [tipo,    setTipo]    = useState('success');

    useEffect(() => {
        const text = flash?.success ?? flash?.error ?? null;
        if (text) {
            setMsg(text);
            setTipo(flash?.success ? 'success' : 'error');
            setVisible(true);
            const t = setTimeout(() => setVisible(false), 4500);
            return () => clearTimeout(t);
        }
    }, [flash?.success, flash?.error]);

    if (!visible) return null;
    const cls = tipo === 'success'
        ? 'bg-green-100 dark:bg-green-900/40 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200'
        : 'bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200';
    return (
        <div className={`fixed top-5 right-5 z-50 border rounded-xl px-4 py-3 text-sm font-medium shadow-lg max-w-sm ${cls}`}>
            {msg}
        </div>
    );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function PermisosIndex({ usuarios, stats }) {
    const { props }      = usePage();
    const [modalOpen,    setModalOpen]    = useState(false);
    const [busqueda,     setBusqueda]     = useState('');
    const [filtroRol,    setFiltroRol]    = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [confirmToggle, setConfirmToggle] = useState(null);
    const [confirmReset,  setConfirmReset]  = useState(null);

    const lista = useMemo(() => {
        let items = usuarios ?? [];
        if (filtroRol)    items = items.filter(u => u.rol === filtroRol);
        if (filtroEstado) items = items.filter(u => u.estado === filtroEstado);
        if (busqueda) {
            const q = busqueda.toLowerCase();
            items = items.filter(u =>
                u.nombre.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q)  ||
                (u.cedula ?? '').toLowerCase().includes(q)
            );
        }
        return items;
    }, [usuarios, busqueda, filtroRol, filtroEstado]);

    const handleToggle = () => {
        router.patch(route('admin.permisos.toggle', confirmToggle.id), {}, { preserveScroll: true });
        setConfirmToggle(null);
    };

    const handleReset = () => {
        router.patch(route('admin.permisos.reset-password', confirmReset.id), {}, { preserveScroll: true });
        setConfirmReset(null);
    };

    return (
        <AdminLayout>
            <Head title="Permisos y Accesos" />
            <FlashToast flash={props.flash} />

            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

                {/* Header */}
                <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-purple-100 dark:bg-purple-900/40 rounded-xl">
                            <Shield size={20} className="text-purple-700 dark:text-purple-300" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Permisos y Accesos</h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Gestión de usuarios del sistema</p>
                        </div>
                    </div>
                    <button onClick={() => setModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
                        <Plus size={16} /> Agregar Usuario
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                    <StatCard icon={Users}     label="Total Usuarios" value={stats.total}    color="purple" />
                    <StatCard icon={Shield}    label="Administradores" value={stats.admins}   color="red"    />
                    <StatCard icon={UserCheck} label="Docentes"        value={stats.docentes} color="blue"   />
                </div>

                {/* Filtros */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={busqueda}
                            onChange={e => setBusqueda(e.target.value)}
                            placeholder="Buscar por nombre, email, cédula..."
                            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                    </div>
                    <select value={filtroRol} onChange={e => setFiltroRol(e.target.value)}
                        className="px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none">
                        <option value="">Todos los roles</option>
                        <option value="admin">Administrador</option>
                        <option value="docente">Docente</option>
                    </select>
                    <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
                        className="px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none">
                        <option value="">Todos los estados</option>
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                    </select>
                </div>

                {/* Tabla */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Usuario</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rol</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Último acceso</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">IP</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Creado</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {lista.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-12 text-center text-gray-400 dark:text-gray-500">
                                            Sin usuarios para los filtros aplicados
                                        </td>
                                    </tr>
                                ) : lista.map(u => {
                                    const rolCfg = ROL_CONFIG[u.rol] ?? ROL_CONFIG.docente;
                                    const activo = u.estado === 'activo';
                                    return (
                                        <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                            {/* Usuario */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <img src={u.foto_url} alt={u.nombre}
                                                        className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{u.nombre}</p>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{u.email}</p>
                                                        {u.cedula && <p className="text-xs text-gray-400 dark:text-gray-500">{u.cedula}</p>}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Rol */}
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${rolCfg.cls}`}>
                                                    {rolCfg.label}
                                                </span>
                                            </td>

                                            {/* Estado (clickeable) */}
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => setConfirmToggle(u)}
                                                    title="Clic para cambiar estado"
                                                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold cursor-pointer transition-opacity hover:opacity-80
                                                        ${activo
                                                            ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                                                            : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
                                                        }`}>
                                                    {activo ? 'Activo' : 'Inactivo'}
                                                </button>
                                            </td>

                                            {/* Último acceso */}
                                            <td className="px-4 py-3 hidden md:table-cell">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {timeAgo(u.last_login_at)}
                                                </span>
                                            </td>

                                            {/* IP */}
                                            <td className="px-4 py-3 hidden lg:table-cell">
                                                <span className="text-xs font-mono text-gray-400 dark:text-gray-500">
                                                    {u.last_login_ip ?? '—'}
                                                </span>
                                            </td>

                                            {/* Creado */}
                                            <td className="px-4 py-3 hidden lg:table-cell">
                                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                                    {u.created_at
                                                        ? new Date(u.created_at).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })
                                                        : '—'}
                                                </span>
                                            </td>

                                            {/* Acciones */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => setConfirmReset(u)}
                                                        title="Resetear contraseña a cédula"
                                                        className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors">
                                                        <Key size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmToggle(u)}
                                                        title={activo ? 'Desactivar usuario' : 'Activar usuario'}
                                                        className={`p-1.5 rounded-lg transition-colors
                                                            ${activo
                                                                ? 'text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                                : 'text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                            }`}>
                                                        <Power size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal crear usuario */}
            <UsuarioModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />

            {/* Confirm toggle estado */}
            <ConfirmDialog
                isOpen={confirmToggle !== null}
                titulo={confirmToggle?.estado === 'activo' ? 'Desactivar usuario' : 'Activar usuario'}
                mensaje={confirmToggle?.estado === 'activo'
                    ? `Se bloqueará el acceso de ${confirmToggle?.nombre}. Podrás reactivarlo luego.`
                    : `Se habilitará el acceso de ${confirmToggle?.nombre} al sistema.`}
                labelConfirmar={confirmToggle?.estado === 'activo' ? 'Desactivar' : 'Activar'}
                colorBtn={confirmToggle?.estado === 'activo' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                onConfirmar={handleToggle}
                onCancelar={() => setConfirmToggle(null)}
            />

            {/* Confirm reset password */}
            <ConfirmDialog
                isOpen={confirmReset !== null}
                titulo="Resetear contraseña"
                mensaje={`Se establecerá la cédula de ${confirmReset?.nombre} como nueva contraseña.`}
                labelConfirmar="Resetear"
                colorBtn="bg-amber-500 hover:bg-amber-600"
                onConfirmar={handleReset}
                onCancelar={() => setConfirmReset(null)}
            />
        </AdminLayout>
    );
}
