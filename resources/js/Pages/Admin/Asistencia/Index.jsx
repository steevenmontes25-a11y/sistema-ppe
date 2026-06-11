import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { ClipboardList, Users } from 'lucide-react';

import AdminLayout          from '@/Layouts/AdminLayout';
import PageHeader           from '@/Components/UI/PageHeader';
import StatsAsistencia      from './components/StatsAsistencia';
import FiltrosAsistencia    from './components/FiltrosAsistencia';
import TablaAsistencia      from './components/TablaAsistencia';
import ResumenEstudiantes   from './components/ResumenEstudiantes';
import CorreccionModal      from './components/CorreccionModal';

// ── Constantes de módulo ──────────────────────────────────────────────────────

const TABS = [
    { id: 'docentes',    label: 'Por Docente / Fecha', icon: ClipboardList },
    { id: 'estudiantes', label: 'Por Estudiante',       icon: Users         },
];

// ── Componente principal ──────────────────────────────────────────────────────

export default function AsistenciaIndex({
    asistencias, resumenEstudiantes, stats,
    docentes, cursos, periodoActivo, filtros,
}) {
    const { flash } = usePage().props;

    const [tabActiva,             setTabActiva]             = useState('docentes');
    const [correccionAsistencia,  setCorreccionAsistencia]  = useState(null);
    const [toast,                 setToast]                 = useState(null);

    useEffect(() => {
        if (flash?.success) mostrarToast('success', flash.success);
        if (flash?.error)   mostrarToast('error',   flash.error);
    }, [flash]);

    const mostrarToast = (tipo, mensaje) => {
        setToast({ tipo, mensaje });
        setTimeout(() => setToast(null), 4000);
    };

    return (
        <AdminLayout>
            <div className="space-y-5">

                {/* Header */}
                <PageHeader
                    title="Control de Asistencia"
                    breadcrumbs={[{ label: 'Control de Asistencia' }]}
                />

                {/* Período activo */}
                {periodoActivo && (
                    <div className="flex items-center gap-2 -mt-3">
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                            ● Período activo: {periodoActivo.nombre}
                        </span>
                    </div>
                )}

                {/* Stats */}
                <StatsAsistencia stats={stats} />

                {/* Filtros */}
                <FiltrosAsistencia filtros={filtros} docentes={docentes} cursos={cursos} />

                {/* Tabs */}
                <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
                    {TABS.map(({ id, label, icon: Icon }) => (
                        <button key={id} type="button"
                            onClick={() => setTabActiva(id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                                ${tabActiva === id
                                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                            <Icon size={14} />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Contenido de tab */}
                {tabActiva === 'docentes' ? (
                    <TablaAsistencia
                        asistencias={asistencias}
                        onCorregir={setCorreccionAsistencia}
                    />
                ) : (
                    <ResumenEstudiantes
                        resumenEstudiantes={resumenEstudiantes}
                        asistencias={asistencias}
                        filtros={filtros}
                    />
                )}
            </div>

            {/* Modal de corrección */}
            <CorreccionModal
                isOpen={!!correccionAsistencia}
                asistencia={correccionAsistencia}
                onClose={() => setCorreccionAsistencia(null)}
            />

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-sm font-medium transition-all
                    ${toast.tipo === 'success'
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white'}`}>
                    <span>{toast.tipo === 'success' ? '✅' : '❌'}</span>
                    {toast.mensaje}
                </div>
            )}
        </AdminLayout>
    );
}
