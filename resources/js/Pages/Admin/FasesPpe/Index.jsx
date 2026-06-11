import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Plus, Layers, Filter } from 'lucide-react';
import AdminLayout      from '@/Layouts/AdminLayout';
import CursoFasesPanel  from './components/CursoFasesPanel';
import FaseModal        from './components/FaseModal';

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

// ── Página principal ──────────────────────────────────────────────────────────

export default function FasesPpeIndex({ porCurso, periodos, cursos, periodoSeleccionado, filtros }) {
    const { props } = usePage();

    const [modalOpen,      setModalOpen]      = useState(false);
    const [faseEdit,       setFaseEdit]        = useState(null);
    const [cursoPreselect, setCursoPreselect]  = useState(null);
    const [activeTab,      setActiveTab]       = useState(() => porCurso[0]?.curso?.id ?? null);

    // Sincronizar tab activo si cambia porCurso
    useEffect(() => {
        if (porCurso.length > 0 && !porCurso.find(g => g.curso.id === activeTab)) {
            setActiveTab(porCurso[0].curso.id);
        }
    }, [porCurso]);

    const [filtroPeriodo, setFiltroPeriodo] = useState(filtros?.periodo_id ?? '');
    const [filtroCurso,   setFiltroCurso]   = useState(filtros?.curso_id   ?? '');

    const aplicarFiltros = () => {
        router.get(route('admin.fases.index'), {
            periodo_id: filtroPeriodo || undefined,
            curso_id:   filtroCurso   || undefined,
        }, { preserveState: true, preserveScroll: true });
    };

    const abrirCrear = (curso = null) => {
        setFaseEdit(null);
        setCursoPreselect(curso);
        setModalOpen(true);
    };

    const abrirEditar = (fase) => {
        setFaseEdit(fase);
        setCursoPreselect(null);
        setModalOpen(true);
    };

    const handleEliminar = (fase) => {
        router.delete(route('admin.fases.destroy', fase.id), { preserveScroll: true });
    };

    // Construir lista de cursos para tabs (sin filtro de curso activo)
    const mostrarTabs = !filtros?.curso_id && porCurso.length > 1;
    const gruposVisibles = mostrarTabs
        ? porCurso.filter(g => g.curso.id === activeTab)
        : porCurso;

    // Periodo seleccionado para el modal — fusionamos con preselección de curso
    const periodoModalDefault = periodoSeleccionado;
    const modalPeriodoFinal   = periodoModalDefault;

    // Cursos filtrados por período seleccionado para el modal
    const cursosModal = cursos;

    return (
        <AdminLayout>
            <Head title="Fases PPE" />
            <FlashToast flash={props.flash} />

            <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-6">

                {/* PageHeader */}
                <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-purple-100 dark:bg-purple-900/40 rounded-xl">
                            <Layers size={20} className="text-purple-700 dark:text-purple-300" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Fases PPE</h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Período: {periodoSeleccionado?.nombre ?? 'Sin período activo'}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => abrirCrear()}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
                        <Plus size={16} />
                        Nueva Fase
                    </button>
                </div>

                {/* Filtros */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-5">
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="flex-1 min-w-[180px]">
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                                Período Lectivo
                            </label>
                            <select
                                value={filtroPeriodo}
                                onChange={e => setFiltroPeriodo(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none">
                                <option value="">Todos los períodos</option>
                                {periodos.map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1 min-w-[160px]">
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                                Curso
                            </label>
                            <select
                                value={filtroCurso}
                                onChange={e => setFiltroCurso(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none">
                                <option value="">Todos los cursos</option>
                                {cursos.map(c => (
                                    <option key={c.id} value={c.id}>{c.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <button onClick={aplicarFiltros}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-colors">
                            <Filter size={14} />
                            Filtrar
                        </button>
                    </div>
                </div>

                {/* Tabs de curso */}
                {mostrarTabs && porCurso.length > 0 && (
                    <div className="flex gap-1 mb-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1.5">
                        {porCurso.map(g => (
                            <button
                                key={g.curso.id}
                                onClick={() => setActiveTab(g.curso.id)}
                                className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-colors
                                    ${activeTab === g.curso.id
                                        ? 'bg-purple-600 text-white'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}>
                                {g.curso.nombre.split(' ')[0]}
                                <span className="ml-1.5 text-xs opacity-70">
                                    ({g.fases.length})
                                </span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Paneles */}
                {porCurso.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-16 text-center">
                        <Layers size={40} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                            No hay fases para el período seleccionado
                        </p>
                        <button onClick={() => abrirCrear()}
                            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-xl transition-colors">
                            Crear primera fase
                        </button>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {gruposVisibles.map(g => (
                            <CursoFasesPanel
                                key={g.curso.id}
                                grupoCurso={g}
                                onEditar={abrirEditar}
                                onCrear={abrirCrear}
                                onEliminar={handleEliminar}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal siempre montado */}
            <FaseModal
                isOpen={modalOpen}
                fase={faseEdit}
                periodos={periodos}
                cursos={cursosModal}
                periodoSeleccionado={modalPeriodoFinal}
                cursoPreselect={cursoPreselect}
                onClose={() => { setModalOpen(false); setCursoPreselect(null); }}
            />
        </AdminLayout>
    );
}
