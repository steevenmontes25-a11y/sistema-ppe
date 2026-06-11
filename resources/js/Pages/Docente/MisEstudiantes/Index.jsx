import { useState, useMemo } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { createPortal } from 'react-dom';
import { Search, Users } from 'lucide-react';
import DocenteLayout      from '@/Layouts/DocenteLayout';
import EstudianteCard     from './components/EstudianteCard';
import EstudianteDetalleModal from './components/EstudianteDetalleModal';

// ── FlashToast ────────────────────────────────────────────────────────────────

function FlashToast({ flash }) {
    const [visible, setVisible] = useState(!!flash?.success || !!flash?.error);
    if (!visible) return null;
    const msg = flash?.success ?? flash?.error;
    const cls = flash?.success
        ? 'bg-green-100 dark:bg-green-900/40 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200'
        : 'bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200';
    return createPortal(
        <div className={`fixed top-5 right-5 z-50 border rounded-xl px-4 py-3 text-sm font-medium shadow-lg max-w-sm ${cls}`}>
            {msg}
        </div>,
        document.body
    );
}

// ── StatCard ──────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, colorCls }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3">
            <div className={`p-2.5 rounded-xl text-xl ${colorCls}`}>{icon}</div>
            <div>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">{label}</p>
                {sub && <p className="text-[10px] text-gray-400 dark:text-gray-500">{sub}</p>}
            </div>
        </div>
    );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function MisEstudiantesIndex({
    estudiantes,
    cursosAsignados,
    periodoActivo,
    cursoFiltro,
    stats,
}) {
    const { props }          = usePage();
    const [busqueda,     setBusqueda]     = useState('');
    const [detalle,      setDetalle]      = useState(null);

    const cambiarCurso = (cursoId) => {
        router.get(
            route('docente.estudiantes.index'),
            cursoId ? { curso_id: cursoId } : {},
            { preserveState: false }
        );
    };

    const lista = useMemo(() => {
        if (!busqueda.trim()) return estudiantes;
        const q = busqueda.toLowerCase();
        return estudiantes.filter(e =>
            (e.nombre_completo ?? '').toLowerCase().includes(q) ||
            (e.numero_matricula ?? '').toLowerCase().includes(q) ||
            (e.cedula ?? '').toLowerCase().includes(q)
        );
    }, [estudiantes, busqueda]);

    return (
        <DocenteLayout>
            <Head title="Mis Estudiantes" />
            <FlashToast flash={props.flash} />

            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-5">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mis Estudiantes</h1>
                    {periodoActivo && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            Período: <span className="font-medium">{periodoActivo.nombre}</span>
                        </p>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatCard icon="👥" label="Total estudiantes"  value={stats.total}
                        colorCls="bg-purple-100 dark:bg-purple-900/40" />
                    <StatCard icon="✅" label="Activos"            value={stats.activos}
                        colorCls="bg-green-100 dark:bg-green-900/40" />
                    <StatCard icon="⭐" label="Promedio notas"
                        value={stats.promedio_global > 0 ? `${stats.promedio_global}/10` : '—'}
                        colorCls="bg-yellow-100 dark:bg-yellow-900/40" />
                    <StatCard icon="📅" label="Prom. asistencia"
                        value={`${stats.asistencia_prom}%`}
                        colorCls="bg-blue-100 dark:bg-blue-900/40" />
                </div>

                {/* Filtros */}
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Búsqueda local */}
                    <div className="relative flex-1">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={busqueda}
                            onChange={e => setBusqueda(e.target.value)}
                            placeholder="Buscar por nombre, matrícula..."
                            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600
                                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                                rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                    </div>

                    {/* Tabs de curso (router.get) */}
                    {cursosAsignados.length > 1 && (
                        <div className="flex gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-1 flex-shrink-0">
                            <button
                                onClick={() => cambiarCurso(null)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
                                    ${!cursoFiltro
                                        ? 'bg-purple-600 text-white'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}>
                                Todos
                            </button>
                            {cursosAsignados.map(c => (
                                <button key={c.id}
                                    onClick={() => cambiarCurso(c.id)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
                                        ${cursoFiltro === c.id
                                            ? 'bg-purple-600 text-white'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}>
                                    {c.nombre}{c.paralelo ? ` ${c.paralelo}` : ''}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Grid de cards */}
                {lista.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-16 text-center">
                        <Users size={40} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                            {busqueda
                                ? 'Sin resultados para la búsqueda'
                                : 'No tienes estudiantes asignados en este período'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {lista.map(est => (
                            <EstudianteCard
                                key={est.id}
                                estudiante={est}
                                onVerDetalle={setDetalle}
                            />
                        ))}
                    </div>
                )}
            </div>

            <EstudianteDetalleModal
                estudiante={detalle}
                onClose={() => setDetalle(null)}
            />
        </DocenteLayout>
    );
}
