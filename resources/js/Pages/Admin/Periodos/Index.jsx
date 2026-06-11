import { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Plus, Clock, Users, GraduationCap, Layers } from 'lucide-react';
import AdminLayout        from '@/Layouts/AdminLayout';
import PeriodoActivoBanner from './components/PeriodoActivoBanner';
import PeriodoCard         from './components/PeriodoCard';
import PeriodoModal        from './components/PeriodoModal';

// ── Flash toast ───────────────────────────────────────────────────────────────

function FlashToast({ flash }) {
    const [visible, setVisible] = useState(false);
    const [msg, setMsg]         = useState('');
    const [tipo, setTipo]       = useState('success');

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

// ── Stat card simple ──────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color }) {
    const colors = {
        purple: 'border-l-purple-500 bg-purple-50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400',
        blue:   'border-l-blue-500   bg-blue-50   dark:bg-blue-900/10   text-blue-600   dark:text-blue-400',
        green:  'border-l-green-500  bg-green-50  dark:bg-green-900/10  text-green-600  dark:text-green-400',
    };
    return (
        <div className={`rounded-xl border border-gray-200 dark:border-gray-700 border-l-4 p-4 ${colors[color]}`}>
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <Icon size={16} className={colors[color].split(' ')[3] ?? ''} />
                </div>
                <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                </div>
            </div>
        </div>
    );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function PeriodsIndex({ periodos, periodoActivo, stats_globales }) {
    const { props } = usePage();
    const [modalOpen,    setModalOpen]    = useState(false);
    const [periodoEdit,  setPeriodoEdit]  = useState(null);

    const abrirCrear = () => {
        setPeriodoEdit(null);
        setModalOpen(true);
    };

    const abrirEditar = (periodo) => {
        setPeriodoEdit(periodo);
        setModalOpen(true);
    };

    return (
        <AdminLayout>
            <Head title="Períodos Lectivos" />
            <FlashToast flash={props.flash} />

            <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-6">

                {/* PageHeader */}
                <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-purple-100 dark:bg-purple-900/40 rounded-xl">
                            <Clock size={20} className="text-purple-700 dark:text-purple-300" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                Períodos Lectivos
                            </h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Gestión de años académicos
                            </p>
                        </div>
                    </div>
                    <button onClick={abrirCrear}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
                        <Plus size={16} />
                        Nuevo Período
                    </button>
                </div>

                {/* Banner período activo */}
                <PeriodoActivoBanner periodo={periodoActivo} />

                {/* Stats globales */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                    <StatCard icon={Layers}       label="Total Períodos"    value={stats_globales.total_periodos}    color="purple" />
                    <StatCard icon={Users}         label="Total Estudiantes" value={stats_globales.total_estudiantes} color="blue"   />
                    <StatCard icon={GraduationCap} label="Total Docentes"    value={stats_globales.total_docentes}    color="green"  />
                </div>

                {/* Lista de períodos */}
                {periodos.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-16 text-center">
                        <Clock size={40} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">No hay períodos registrados</p>
                        <button onClick={abrirCrear}
                            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-xl transition-colors">
                            Crear primer período
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {periodos.map(p => (
                            <PeriodoCard
                                key={p.id}
                                periodo={p}
                                onEditar={abrirEditar}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal siempre montado */}
            <PeriodoModal
                isOpen={modalOpen}
                periodo={periodoEdit}
                onClose={() => setModalOpen(false)}
            />
        </AdminLayout>
    );
}
