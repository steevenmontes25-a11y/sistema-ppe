import { Head, router } from '@inertiajs/react';
import EstudianteLayout from '@/Layouts/EstudianteLayout';
import ResumenAsistencia from './components/ResumenAsistencia';
import CalendarioMes from './components/CalendarioMes';
import HistorialMeses from './components/HistorialMeses';

function capitalize(s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

export default function MiAsistencia({
    asistenciasMes, porMes, stats, periodoActivo,
    sinMatricula, curso, mesFiltro, anioFiltro, mesesDisponibles,
}) {
    if (sinMatricula) {
        return (
            <EstudianteLayout title="Mi Asistencia">
                <Head title="Mi Asistencia" />
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <p className="text-5xl mb-4">📋</p>
                    <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">
                        Sin matrícula activa
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                        No estás matriculado en ningún curso del período activo.
                        Contacta a tu coordinador para regularizar tu situación.
                    </p>
                </div>
            </EstudianteLayout>
        );
    }

    const mesActualNombre = mesesDisponibles.find(
        m => m.valor === `${anioFiltro}-${String(mesFiltro).padStart(2, '0')}`
    )?.nombre ?? '';

    const handleMesChange = (e) => {
        const [anio, mes] = e.target.value.split('-');
        router.get(
            route('estudiante.asistencia.index'),
            { mes, anio },
            { preserveScroll: true }
        );
    };

    return (
        <EstudianteLayout title="Mi Asistencia">
            <Head title="Mi Asistencia" />

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Mi Asistencia</h1>
                {curso && periodoActivo && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {curso.nombre} · {periodoActivo.nombre}
                    </p>
                )}
            </div>

            {/* Resumen del período */}
            <ResumenAsistencia stats={stats} />

            {/* Selector de mes */}
            {mesesDisponibles.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4
                    bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2 flex-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400">📅 Viendo:</span>
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                            {capitalize(mesActualNombre)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            Cambiar mes:
                        </label>
                        <select
                            value={`${anioFiltro}-${String(mesFiltro).padStart(2, '0')}`}
                            onChange={handleMesChange}
                            className="text-xs border border-gray-200 dark:border-gray-700
                                bg-white dark:bg-gray-700
                                text-gray-800 dark:text-gray-200
                                rounded-xl px-3 py-2
                                focus:outline-none focus:ring-2 focus:ring-purple-400">
                            {mesesDisponibles.map(m => (
                                <option key={m.valor} value={m.valor}>
                                    {capitalize(m.nombre)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Calendario del mes seleccionado */}
            <CalendarioMes
                asistenciasMes={asistenciasMes}
                mesFiltro={mesFiltro}
                anioFiltro={anioFiltro}
            />

            {/* Historial por mes */}
            <HistorialMeses
                porMes={porMes}
                stats={stats}
                mesFiltro={mesFiltro}
                anioFiltro={anioFiltro}
            />
        </EstudianteLayout>
    );
}
