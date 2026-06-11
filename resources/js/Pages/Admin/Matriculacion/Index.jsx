import { useState, useMemo, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import { Search, Users, CheckCircle, XCircle, Eye, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

import AdminLayout             from '@/Layouts/AdminLayout';
import PageHeader              from '@/Components/UI/PageHeader';
import ConfirmDialog           from '@/Components/UI/ConfirmDialog';
import StatsBar                from './components/StatsBar';
import EstudianteModal         from './components/EstudianteModal';
import EstudianteDetalleModal  from './components/EstudianteDetalleModal';

// ── Module-scope helpers ──────────────────────────────────────────────────────

const AVATAR_COLORS = [
    'bg-purple-500', 'bg-blue-500', 'bg-green-500',
    'bg-yellow-500', 'bg-red-500',  'bg-pink-500', 'bg-indigo-500',
];

const getAvatarColor = (nombre = '') =>
    AVATAR_COLORS[nombre.charCodeAt(0) % AVATAR_COLORS.length];

const getInitials = (nombres = '', apellidos = '') =>
    ((nombres[0] || '') + (apellidos[0] || '')).toUpperCase();

const CURSO_BADGE = {
    'Primero': 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    'Segundo': 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
    'Tercero': 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
};

const cursoBadgeClass = (nombre = '') => {
    for (const key of Object.keys(CURSO_BADGE)) {
        if (nombre.startsWith(key)) return CURSO_BADGE[key];
    }
    return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function MatriculacionIndex({
    estudiantes, cursos, docentes, periodoActivo, cursoFiltro, stats,
}) {
    const { flash } = usePage().props;

    const [modalOpen,         setModalOpen]         = useState(false);
    const [detalleEstudiante, setDetalleEstudiante] = useState(null);
    const [busqueda,          setBusqueda]          = useState('');
    const [estadoFiltro,      setEstadoFiltro]      = useState('');
    const [confirmDialog,     setConfirmDialog]     = useState(null);
    const [toast,             setToast]             = useState(null);

    // Flash → toast
    useEffect(() => {
        if (flash?.success) mostrarToast('success', flash.success);
        if (flash?.error)   mostrarToast('error',   flash.error);
    }, [flash]);

    const mostrarToast = (tipo, mensaje) => {
        setToast({ tipo, mensaje });
        setTimeout(() => setToast(null), 4000);
    };

    // Filtrado cliente
    const estudiantesFiltrados = useMemo(() => {
        const term = busqueda.toLowerCase();
        return (estudiantes?.data || []).filter(e => {
            const matchBusqueda = !term
                || (e.nombres          || '').toLowerCase().includes(term)
                || (e.apellidos        || '').toLowerCase().includes(term)
                || (e.cedula           || '').toLowerCase().includes(term)
                || (e.numero_matricula || '').toLowerCase().includes(term)
                || (e.email            || '').toLowerCase().includes(term);
            const matchEstado = !estadoFiltro || e.estado === estadoFiltro;
            return matchBusqueda && matchEstado;
        });
    }, [estudiantes?.data, busqueda, estadoFiltro]);

    // Filtro de curso server-side
    const filtrarCurso = (cursoId) => {
        router.get(route('admin.matriculacion.index'),
            { curso_id: cursoId || undefined },
            { preserveScroll: true }
        );
    };

    // Toggle estado con confirmación
    const handleToggleEstado = (estudiante) => {
        const esActivo = estudiante.estado === 'activo';
        setConfirmDialog({
            open:           true,
            titulo:         esActivo ? `¿Desactivar a ${estudiante.nombres}?` : `¿Reactivar a ${estudiante.nombres}?`,
            mensaje:        esActivo
                ? 'El estudiante perderá acceso al sistema temporalmente. Sus datos se conservarán.'
                : 'El estudiante recuperará acceso completo al sistema.',
            tipo:           esActivo ? 'warning' : 'success',
            labelConfirmar: esActivo ? 'Desactivar' : 'Reactivar',
            onConfirm: () => {
                const ruta = esActivo
                    ? route('admin.matriculacion.baja',      estudiante.id)
                    : route('admin.matriculacion.reactivar', estudiante.id);
                router.patch(ruta, {}, {
                    onSuccess:      () => setConfirmDialog(null),
                    preserveScroll: true,
                });
            },
        });
    };

    // Lookup docente por id
    const docenteNombre = (docenteId) => {
        if (!docenteId) return '—';
        const d = (docentes || []).find(d => d.id === docenteId);
        if (!d) return '—';
        return d.nombres && d.apellidos ? `${d.nombres} ${d.apellidos}` : (d.name || '—');
    };

    const paginador = estudiantes || {};

    return (
        <AdminLayout title="Matriculación de Estudiantes">

            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 z-[70] px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all
                    ${toast.tipo === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {toast.mensaje}
                </div>
            )}

            {/* Confirm dialog — portal, z-index 9999 */}
            <ConfirmDialog
                open={!!confirmDialog?.open}
                titulo={confirmDialog?.titulo ?? ''}
                mensaje={confirmDialog?.mensaje ?? ''}
                tipo={confirmDialog?.tipo ?? 'warning'}
                labelConfirmar={confirmDialog?.labelConfirmar ?? 'Confirmar'}
                onConfirm={confirmDialog?.onConfirm ?? (() => {})}
                onCancel={() => setConfirmDialog(null)}
            />

            {/* Modal nuevo estudiante */}
            <EstudianteModal
                isOpen={modalOpen}
                cursos={cursos || []}
                docentes={docentes || []}
                periodoActivo={periodoActivo}
                stats={stats}
                onClose={() => setModalOpen(false)}
            />

            {/* Modal detalle/edición */}
            <EstudianteDetalleModal
                isOpen={!!detalleEstudiante}
                estudiante={detalleEstudiante}
                cursos={cursos || []}
                docentes={docentes || []}
                periodoActivo={periodoActivo}
                onClose={() => setDetalleEstudiante(null)}
            />

            {/* Header */}
            <PageHeader
                title="Matriculación de Estudiantes"
                breadcrumbs={[{ label: 'Matriculación' }]}
                action={
                    <button onClick={() => setModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium text-sm transition-colors shadow-sm">
                        <Plus size={16} /> Matricular Estudiante
                    </button>
                }
            />

            {periodoActivo && (
                <p className="text-sm text-gray-500 dark:text-gray-400 -mt-4 mb-5">
                    Período activo:{' '}
                    <span className="font-medium text-purple-700 dark:text-purple-300">{periodoActivo.nombre}</span>
                </p>
            )}

            {/* Stats */}
            <StatsBar stats={stats} />

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        placeholder="Buscar por nombre, cédula, matrícula o email..."
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                    />
                </div>

                <select
                    value={cursoFiltro || ''}
                    onChange={e => filtrarCurso(e.target.value)}
                    className="py-2.5 px-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-400 outline-none">
                    <option value="">Todos los cursos</option>
                    {(cursos || []).map(c => (
                        <option key={c.id} value={String(c.id)}>{c.nombre}</option>
                    ))}
                </select>

                <select
                    value={estadoFiltro}
                    onChange={e => setEstadoFiltro(e.target.value)}
                    className="py-2.5 px-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-400 outline-none">
                    <option value="">Todos los estados</option>
                    <option value="activo">Activos</option>
                    <option value="inactivo">Inactivos</option>
                </select>

                <div className="flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                    <span className="font-semibold text-purple-700 dark:text-purple-300 mr-1">{estudiantesFiltrados.length}</span>
                    encontrado{estudiantesFiltrados.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Tabla */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {estudiantesFiltrados.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                        <Users size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            No hay estudiantes matriculados
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                            {busqueda || estadoFiltro
                                ? 'No se encontraron resultados con los filtros aplicados.'
                                : 'Comienza matriculando al primer estudiante.'}
                        </p>
                        {!busqueda && !estadoFiltro && (
                            <button onClick={() => setModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors">
                                <Plus size={14} /> Matricular primer estudiante
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-purple-700 text-white">
                                        {['#', 'Estudiante', 'Matrícula', 'Cédula', 'Curso', 'Docente', 'Estado', 'Ver'].map(h => (
                                            <th key={h}
                                                className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider
                                                    ${h === '#' || h === 'Ver' ? 'w-10 text-center' : h === 'Estado' ? 'text-center' : 'text-left'}`}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {estudiantesFiltrados.map((est, idx) => {
                                        const curso     = est.cursos?.[0];
                                        const docenteId = curso?.pivot?.docente_id;
                                        const avatarColor = getAvatarColor(est.nombres || est.name || '');

                                        return (
                                            <tr key={est.id}
                                                className="bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors">

                                                {/* # */}
                                                <td className="px-4 py-3 text-center text-xs text-gray-400 dark:text-gray-500">
                                                    {(paginador.from ?? 1) + idx}
                                                </td>

                                                {/* Estudiante */}
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${avatarColor}`}>
                                                            {getInitials(est.nombres, est.apellidos)}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                                                {est.nombres && est.apellidos
                                                                    ? `${est.nombres} ${est.apellidos}`
                                                                    : est.name}
                                                            </p>
                                                            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{est.email}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Matrícula */}
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-mono">
                                                        {est.numero_matricula || '—'}
                                                    </span>
                                                </td>

                                                {/* Cédula */}
                                                <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300 font-mono">
                                                    {est.cedula || '—'}
                                                </td>

                                                {/* Curso */}
                                                <td className="px-4 py-3">
                                                    {curso ? (
                                                        <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${cursoBadgeClass(curso.nombre)}`}>
                                                            {curso.nombre}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 dark:text-gray-500">Sin curso</span>
                                                    )}
                                                </td>

                                                {/* Docente */}
                                                <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300 max-w-[140px] truncate">
                                                    {docenteNombre(docenteId)}
                                                </td>

                                                {/* Estado — badge clickeable */}
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => handleToggleEstado(est)}
                                                        title={est.estado === 'activo' ? 'Clic para desactivar' : 'Clic para activar'}
                                                        className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all hover:scale-105 hover:shadow-md
                                                            ${est.estado === 'activo'
                                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/60'
                                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/60'}`}>
                                                        <span className="flex items-center gap-1">
                                                            {est.estado === 'activo'
                                                                ? <><CheckCircle size={12} /> Activo</>
                                                                : <><XCircle size={12} /> Inactivo</>}
                                                        </span>
                                                    </button>
                                                </td>

                                                {/* Ver detalles */}
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => setDetalleEstudiante(est)}
                                                        title="Ver detalles"
                                                        className="p-2 rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors">
                                                        <Eye size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        {(paginador.last_page > 1 || paginador.total > 0) && (
                            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Mostrando{' '}
                                    <span className="font-medium">{paginador.from}</span>–<span className="font-medium">{paginador.to}</span>{' '}
                                    de <span className="font-medium">{paginador.total}</span> estudiantes
                                </p>
                                <div className="flex items-center gap-1">
                                    <button
                                        disabled={!paginador.prev_page_url}
                                        onClick={() => paginador.prev_page_url && router.get(paginador.prev_page_url, {}, { preserveScroll: true })}
                                        className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                                        <ChevronLeft size={14} />
                                    </button>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 px-2">
                                        {paginador.current_page} / {paginador.last_page}
                                    </span>
                                    <button
                                        disabled={!paginador.next_page_url}
                                        onClick={() => paginador.next_page_url && router.get(paginador.next_page_url, {}, { preserveScroll: true })}
                                        className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </AdminLayout>
    );
}
