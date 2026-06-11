import { useState, useEffect } from 'react';
import { usePage, router }    from '@inertiajs/react';
import { Plus, Rows, CalendarDays } from 'lucide-react';

import AdminLayout     from '@/Layouts/AdminLayout';
import PageHeader      from '@/Components/UI/PageHeader';
import VistaLista      from './components/VistaLista';
import VistaCalendario from './components/VistaCalendario';
import ActividadModal  from './components/ActividadModal';

export default function CronogramaIndex({
    fases,
    cursos,
    todasFases,
    periodos,
    periodoActivo,
    cursoActual,
    totalEstudiantes,
}) {
    const { flash } = usePage().props;

    // Vista (lista | calendario) persiste en localStorage
    const [vista, setVista] = useState(
        () => localStorage.getItem('cronograma_vista') || 'lista'
    );
    const [modalOpen,           setModalOpen]           = useState(false);
    const [actividadEditando,   setActividadEditando]   = useState(null);
    const [fechaPreseleccionada, setFechaPreseleccionada] = useState(null);
    const [toast, setToast] = useState(null);

    // Flash → toast 3 s
    useEffect(() => {
        if (flash?.success) mostrarToast('success', flash.success);
        if (flash?.error)   mostrarToast('error',   flash.error);
    }, [flash]);

    const mostrarToast = (tipo, mensaje) => {
        setToast({ tipo, mensaje });
        setTimeout(() => setToast(null), 3000);
    };

    const cambiarVista = (v) => {
        setVista(v);
        localStorage.setItem('cronograma_vista', v);
    };

    // Navegar a otro curso (por ID entero)
    const irCurso = (cursoId) => {
        router.get(
            route('admin.cronograma.index'),
            { curso: cursoId, periodo_id: periodoActivo?.id },
            { preserveScroll: true }
        );
    };

    const cambiarPeriodo = (e) => {
        router.get(
            route('admin.cronograma.index'),
            { curso: cursoActual, periodo_id: e.target.value },
            { preserveScroll: true }
        );
    };

    // Abrir modal — crear nueva
    const abrirNueva = (fecha = null) => {
        setActividadEditando(null);
        setFechaPreseleccionada(fecha);
        setModalOpen(true);
    };

    // Abrir modal — editar existente
    const abrirEditar = (act) => {
        setActividadEditando(act);
        setFechaPreseleccionada(null);
        setModalOpen(true);
    };

    const cerrarModal = () => {
        setModalOpen(false);
        setActividadEditando(null);
        setFechaPreseleccionada(null);
    };

    // Actividades planas para la vista calendario
    const todasActividades = (fases || []).flatMap(f => f.actividades || []);

    // Nombre del curso seleccionado actualmente
    const cursoSeleccionado = (cursos || []).find(c => c.id === cursoActual);

    return (
        <AdminLayout title="Cronograma de Actividades">

            {/* Toast flash */}
            {toast && (
                <div className={`fixed top-4 right-4 z-[60] px-4 py-3 rounded-xl shadow-lg text-sm font-medium
                    ${toast.tipo === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {toast.mensaje}
                </div>
            )}

            <PageHeader
                title="Cronograma de Actividades"
                breadcrumbs={[{ label: 'Cronograma' }]}
                action={
                    <button onClick={() => abrirNueva()}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium text-sm transition-colors shadow-sm">
                        <Plus size={16} />
                        Nueva Actividad
                    </button>
                }
            />

            {/* Tabs de curso (generados dinámicamente desde la BD) */}
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl w-fit mb-4 flex-wrap">
                {(cursos || []).map(curso => (
                    <button key={curso.id}
                        onClick={() => irCurso(curso.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                            ${cursoActual === curso.id
                                ? 'bg-purple-600 text-white shadow-sm'
                                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-200/60 dark:hover:bg-gray-600/60'
                            }`}>
                        {curso.nombre}
                    </button>
                ))}
            </div>

            {/* Barra de controles */}
            <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
                {/* Selector de período */}
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Período:</label>
                    <select value={periodoActivo?.id || ''}
                        onChange={cambiarPeriodo}
                        className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5
                            bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100
                            focus:outline-none focus:ring-2 focus:ring-purple-400">
                        {(periodos || []).map(p => (
                            <option key={p.id} value={p.id}>{p.nombre}</option>
                        ))}
                    </select>
                </div>

                {/* Toggle lista / calendario */}
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                    <button onClick={() => cambiarVista('lista')} title="Vista lista"
                        className={`p-2 rounded-lg transition-all ${vista === 'lista'
                            ? 'bg-white dark:bg-gray-600 shadow-sm text-purple-700 dark:text-purple-300'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
                        <Rows size={16} />
                    </button>
                    <button onClick={() => cambiarVista('calendario')} title="Vista calendario"
                        className={`p-2 rounded-lg transition-all ${vista === 'calendario'
                            ? 'bg-white dark:bg-gray-600 shadow-sm text-purple-700 dark:text-purple-300'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
                        <CalendarDays size={16} />
                    </button>
                </div>
            </div>

            {/* Contenido principal */}
            {vista === 'lista' ? (
                <VistaLista
                    fases={fases}
                    totalEstudiantes={totalEstudiantes}
                    onEditar={abrirEditar}
                    onCrearPrimera={() => abrirNueva()}
                    cursoNombre={cursoSeleccionado?.nombre}
                    periodoNombre={periodoActivo?.nombre}
                />
            ) : (
                <VistaCalendario
                    actividades={todasActividades}
                    onEditar={abrirEditar}
                    onCrearEnFecha={(fecha) => abrirNueva(fecha)}
                />
            )}

            {/* Modal crear / editar — siempre montado, visibilidad por isOpen */}
            <ActividadModal
                isOpen={modalOpen}
                actividad={actividadEditando}
                fases={todasFases || []}
                cursos={cursos || []}
                onClose={cerrarModal}
                fechaPreseleccionada={fechaPreseleccionada}
            />
        </AdminLayout>
    );
}
