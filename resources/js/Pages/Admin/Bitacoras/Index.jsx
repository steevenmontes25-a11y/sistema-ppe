import { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import StatsBitacoras      from './components/StatsBitacoras';
import FiltrosBitacoras    from './components/FiltrosBitacoras';
import ExportarMenu        from './components/ExportarMenu';
import VistaPorCurso       from './components/VistaPorCurso';
import VistaPorDocente     from './components/VistaPorDocente';
import BitacoraDetalleModal from './components/BitacoraDetalleModal';

// ── Sub-componentes de layout ────────────────────────────────────────────────

function PageHeader({ children }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-100 dark:bg-purple-900/40 rounded-xl">
                    <BookOpen size={20} className="text-purple-700 dark:text-purple-300" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Bitácoras</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Visualización y reportes — solo lectura</p>
                </div>
            </div>
            {children}
        </div>
    );
}

function TabButton({ active, onClick, children }) {
    return (
        <button
            onClick={onClick}
            className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                active
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20'
            }`}>
            {children}
        </button>
    );
}

function FlashToast({ flash }) {
    const [visible, setVisible] = useState(false);
    const [msg, setMsg]         = useState('');
    const [tipo, setTipo]       = useState('success');

    useEffect(() => {
        if (flash?.success || flash?.error) {
            setMsg(flash.success ?? flash.error);
            setTipo(flash.success ? 'success' : 'error');
            setVisible(true);
            const t = setTimeout(() => setVisible(false), 4000);
            return () => clearTimeout(t);
        }
    }, [flash]);

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

// ── Página principal ─────────────────────────────────────────────────────────

export default function BitacorasIndex({ stats, porCurso, porDocente, filtros, cursos, docentes }) {
    const { props } = usePage();
    const [tab,      setTab]      = useState('curso');
    const [detalle,  setDetalle]  = useState(null);

    return (
        <AdminLayout>
            <Head title="Bitácoras" />
            <FlashToast flash={props.flash} />

            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <PageHeader>
                    <ExportarMenu filtros={filtros} />
                </PageHeader>

                {/* Stats */}
                <StatsBitacoras stats={stats} />

                {/* Filtros */}
                <div className="mt-4">
                    <FiltrosBitacoras
                        filtros={filtros}
                        cursos={cursos}
                        docentes={docentes}
                    />
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mt-5 mb-4">
                    <TabButton active={tab === 'curso'}   onClick={() => setTab('curso')}>
                        📚 Por Curso
                    </TabButton>
                    <TabButton active={tab === 'docente'} onClick={() => setTab('docente')}>
                        👨‍🏫 Por Docente
                    </TabButton>
                </div>

                {/* Vistas */}
                {tab === 'curso' && (
                    <VistaPorCurso
                        porCurso={porCurso}
                        onVerDetalle={(b) => setDetalle(b)}
                    />
                )}
                {tab === 'docente' && (
                    <VistaPorDocente
                        porDocente={porDocente}
                        onVerDetalle={(b) => setDetalle(b)}
                    />
                )}
            </div>

            {/* Modal siempre montado */}
            <BitacoraDetalleModal
                isOpen={detalle !== null}
                bitacora={detalle}
                onClose={() => setDetalle(null)}
            />
        </AdminLayout>
    );
}
