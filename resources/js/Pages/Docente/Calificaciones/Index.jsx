import { useState, useEffect, useMemo } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { createPortal } from 'react-dom';
import {
    ChevronDown, ChevronRight, BookOpen, Star, Clock,
    CheckCircle2, FileText, LayoutList, LayoutGrid, AlertTriangle,
} from 'lucide-react';
import DocenteLayout  from '@/Layouts/DocenteLayout';
import FilaBitacora   from './components/FilaBitacora';
import CalificarModal from './components/CalificarModal';
import NoEntregaModal from './components/NoEntregaModal';

// ── Módulo: colores de nota ───────────────────────────────────────────────────

const NOTA_TEXT = {
    green:  'text-green-600 dark:text-green-400',
    blue:   'text-blue-600 dark:text-blue-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    red:    'text-red-600 dark:text-red-400',
};
function notaColorKey(nota) {
    const n = parseFloat(nota) || 0;
    if (n >= 9) return 'green';
    if (n >= 7) return 'blue';
    if (n >= 5) return 'yellow';
    return 'red';
}
function actividadVencida(config) {
    if (!config?.actividad?.fecha_finalizacion) return false;
    return new Date(String(config.actividad.fecha_finalizacion).slice(0, 10) + 'T23:59:59') < new Date();
}

// ── FlashToast ─────────────────────────────────────────────────────────────────

function FlashToast({ flash }) {
    const [visible, setVisible] = useState(false);
    const [msg, setMsg]         = useState('');
    const [tipo, setTipo]       = useState('success');

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

// ── StatCard ──────────────────────────────────────────────────────────────────

const STAT_COLORS = {
    blue:   'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    green:  'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
};
function StatCard({ icon: Icon, label, value, color }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${STAT_COLORS[color]}`}>
                <Icon size={18} />
            </div>
            <div className="min-w-0">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">{value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            </div>
        </div>
    );
}

// ── Página principal ───────────────────────────────────────────────────────────

export default function CalificacionesIndex({
    fases,
    cursosAsignados,
    periodoActivo,
    stats,
    filtros,
}) {
    const { props } = usePage();

    // Vista
    const [modoVista, setModoVista] = useState(
        () => localStorage.getItem('cal-vista') || 'acordeon'
    );
    const cambiarVista = (v) => {
        setModoVista(v);
        localStorage.setItem('cal-vista', v);
    };

    // Acordeones
    const [expandFases, setExpandFases] = useState({});
    const [expandBits,  setExpandBits]  = useState({});
    const toggleFase = (id) => setExpandFases(prev => ({ ...prev, [id]: !prev[id] }));
    const toggleBit  = (id) => setExpandBits(prev =>  ({ ...prev, [id]: !prev[id] }));

    // Modal calificar
    const [modalFila,   setModalFila]   = useState(null);
    const [modalConfig, setModalConfig] = useState(null);
    const [modalCurso,  setModalCurso]  = useState('');
    const abrirModal = (fila, config, cursoNombre) => {
        setModalFila(fila); setModalConfig(config); setModalCurso(cursoNombre);
    };
    const cerrarModal = () => {
        setModalFila(null); setModalConfig(null); setModalCurso('');
    };

    // Modal no-entrega
    const [neFila,   setNeFila]   = useState(null);
    const [neConfig, setNeConfig] = useState(null);
    const abrirModalNoEntrega = (fila, config) => {
        setNeFila(fila); setNeConfig(config);
    };
    const cerrarModalNoEntrega = () => {
        setNeFila(null); setNeConfig(null);
    };

    // Filtros
    const cambiarFiltro = (key, val) => {
        const params = {};
        if (filtros.curso_id && key !== 'curso_id') params.curso_id = filtros.curso_id;
        if (filtros.estado   && key !== 'estado')   params.estado   = filtros.estado;
        params[key] = val;
        router.get(route('docente.calificaciones.index'), params);
    };

    // Matriz para modo lista
    const matrizCalificaciones = useMemo(() => {
        const estudiantesMap = {};
        const bitacorasMap   = {};

        fases.forEach(fase => {
            fase.bitacoras.forEach(bit => {
                bitacorasMap[bit.config.numero_global] = bit.config;
                bit.filas.forEach(fila => {
                    const id = fila.estudiante.id;
                    if (!estudiantesMap[id]) {
                        estudiantesMap[id] = {
                            estudiante: fila.estudiante,
                            curso:      fase.curso,
                            notas:      {},
                        };
                    }
                    estudiantesMap[id].notas[bit.config.numero_global] = {
                        entrega:      fila.entrega,
                        calificacion: fila.calificacion,
                        estado:       fila.estado,
                        config:       bit.config,
                    };
                });
            });
        });

        return {
            estudiantes: Object.values(estudiantesMap),
            bitacoras:   Object.values(bitacorasMap)
                .sort((a, b) => a.numero_global - b.numero_global),
        };
    }, [fases]);

    const ESTADOS_FILTRO = [
        { key: 'todas',       label: 'Todas' },
        { key: 'pendientes',  label: '⏳ Pendientes' },
        { key: 'calificadas', label: '✅ Calificadas' },
    ];

    return (
        <DocenteLayout>
            <Head title="Calificaciones" />
            <FlashToast flash={props.flash} />

            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-5">

                {/* Header */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Calificaciones</h1>
                        {periodoActivo && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                Período: <span className="font-medium">{periodoActivo.nombre}</span>
                            </p>
                        )}
                    </div>

                    {/* Toggle vista */}
                    <div className="flex gap-1 rounded-xl border border-gray-200 dark:border-gray-700 p-1 bg-white dark:bg-gray-800">
                        <button
                            onClick={() => cambiarVista('acordeon')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
                                ${modoVista === 'acordeon'
                                    ? 'bg-purple-600 text-white'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800'
                                }`}>
                            <LayoutGrid size={13} /> Por fases
                        </button>
                        <button
                            onClick={() => cambiarVista('lista')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
                                ${modoVista === 'lista'
                                    ? 'bg-purple-600 text-white'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800'
                                }`}>
                            <LayoutList size={13} /> Lista completa
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatCard icon={FileText}     label="Total entregas"  value={stats.total_entregas}  color="blue"   />
                    <StatCard icon={Clock}        label="Pendientes"      value={stats.pendientes}      color="yellow" />
                    <StatCard icon={CheckCircle2} label="Calificadas"     value={stats.calificadas}     color="green"  />
                    <StatCard icon={Star}         label="Promedio global"
                        value={stats.promedio_global > 0 ? `${stats.promedio_global}/10` : '—'}
                        color="purple" />
                </div>

                {/* Filtros */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex flex-wrap items-center gap-3">
                        {cursosAsignados.length > 1 && (
                            <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                                <button onClick={() => cambiarFiltro('curso_id', '')}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
                                        ${!filtros.curso_id
                                            ? 'bg-white dark:bg-gray-600 text-purple-700 dark:text-purple-300 shadow-sm'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800'
                                        }`}>
                                    Todos
                                </button>
                                {cursosAsignados.map(c => (
                                    <button key={c.id} onClick={() => cambiarFiltro('curso_id', c.id)}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
                                            ${filtros.curso_id == c.id
                                                ? 'bg-white dark:bg-gray-600 text-purple-700 dark:text-purple-300 shadow-sm'
                                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800'
                                            }`}>
                                        {c.nombre}
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1 ml-auto">
                            {ESTADOS_FILTRO.map(ef => (
                                <button key={ef.key} onClick={() => cambiarFiltro('estado', ef.key)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
                                        ${filtros.estado === ef.key
                                            ? 'bg-white dark:bg-gray-600 text-purple-700 dark:text-purple-300 shadow-sm'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800'
                                        }`}>
                                    {ef.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sin contenido */}
                {fases.length === 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-16 text-center">
                        <BookOpen size={40} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                            {filtros.estado !== 'todas'
                                ? 'No hay bitácoras en este estado'
                                : 'No hay fases configuradas para el período activo'}
                        </p>
                    </div>
                )}

                {/* ══════════════════════════════════ MODO ACORDEÓN ══════════════════════════════════ */}
                {modoVista === 'acordeon' && fases.length > 0 && (
                    <div className="space-y-3">
                        {fases.map((faseData) => {
                            const faseId   = faseData.fase.id;
                            const faseOpen = !!expandFases[faseId];

                            return (
                                <div key={faseId}
                                    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">

                                    {/* Header fase */}
                                    <button onClick={() => toggleFase(faseId)}
                                        className="w-full flex items-center gap-3 px-5 py-4
                                            bg-purple-50 dark:bg-purple-900/20
                                            hover:bg-purple-100 dark:hover:bg-purple-900/30
                                            transition-colors text-left">
                                        {faseOpen
                                            ? <ChevronDown size={18} className="text-purple-600 dark:text-purple-400 flex-shrink-0" />
                                            : <ChevronRight size={18} className="text-purple-600 dark:text-purple-400 flex-shrink-0" />
                                        }
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                                                    Fase {faseData.fase.orden}: {faseData.fase.nombre}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    — {faseData.curso.nombre}
                                                </span>
                                                <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/40
                                                    text-purple-700 dark:text-purple-300 text-[10px] font-semibold rounded-full">
                                                    Bits {faseData.rango}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                {faseData.bitacoras.length} bitácora{faseData.bitacoras.length !== 1 ? 's' : ''} en esta fase
                                            </p>
                                        </div>
                                    </button>

                                    {faseOpen && (
                                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {faseData.bitacoras.map((bitData) => {
                                                const configId = bitData.config.id;
                                                const bitOpen  = !!expandBits[configId];
                                                const pct      = bitData.total > 0
                                                    ? Math.round(bitData.calificadas / bitData.total * 100) : 0;
                                                const sinEntregarVencidas = actividadVencida(bitData.config)
                                                    ? bitData.filas.filter(f => f.estado === 'sin_entregar').length
                                                    : 0;

                                                return (
                                                    <div key={configId}>
                                                        <button onClick={() => toggleBit(configId)}
                                                            className="w-full flex items-center gap-3 px-5 py-3.5
                                                                hover:bg-gray-50 dark:hover:bg-gray-700/40
                                                                transition-colors text-left">
                                                            {bitOpen
                                                                ? <ChevronDown size={15} className="text-gray-400 flex-shrink-0" />
                                                                : <ChevronRight size={15} className="text-gray-400 flex-shrink-0" />
                                                            }
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                                        🔢 Bitácora {bitData.config.numero_global}
                                                                    </span>
                                                                    {bitData.config.actividad ? (
                                                                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                                            {bitData.config.actividad.titulo}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-xs text-gray-400 dark:text-gray-600 italic">Sin vincular</span>
                                                                    )}
                                                                    {sinEntregarVencidas > 0 && (
                                                                        <span className="flex items-center gap-1 text-[10px] font-semibold
                                                                            bg-red-100 dark:bg-red-900/30
                                                                            text-red-600 dark:text-red-400
                                                                            px-2 py-0.5 rounded-full">
                                                                            <AlertTriangle size={10} />
                                                                            {sinEntregarVencidas} sin entregar (plazo vencido)
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-3 mt-1">
                                                                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                                                        {bitData.calificadas}/{bitData.total} calificadas
                                                                        {bitData.promedio !== null && (
                                                                            <> · Prom: <span className="font-semibold">{bitData.promedio}/10</span></>
                                                                        )}
                                                                    </span>
                                                                    <div className="flex-1 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                                        <div className="h-full bg-purple-500 rounded-full transition-all"
                                                                            style={{ width: `${pct}%` }} />
                                                                    </div>
                                                                    <span className="text-[10px] text-gray-400">{pct}%</span>
                                                                </div>
                                                            </div>
                                                        </button>

                                                        {bitOpen && (
                                                            <div className="overflow-x-auto border-t border-gray-100 dark:border-gray-700">
                                                                {bitData.filas.length === 0 ? (
                                                                    <p className="px-8 py-6 text-sm text-gray-400 dark:text-gray-600 text-center">
                                                                        No hay entregas que coincidan con el filtro
                                                                    </p>
                                                                ) : (
                                                                    <table className="w-full">
                                                                        <thead>
                                                                            <tr className="bg-gray-50 dark:bg-gray-700/50">
                                                                                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Estudiante</th>
                                                                                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Estado</th>
                                                                                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Archivo</th>
                                                                                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Nota</th>
                                                                                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Justificación</th>
                                                                                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Acción</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {bitData.filas.map((fila, idx) => (
                                                                                <FilaBitacora
                                                                                    key={`${fila.estudiante.id}-${configId}-${idx}`}
                                                                                    fila={fila}
                                                                                    config={bitData.config}
                                                                                    onCalificar={(f) => abrirModal(f, bitData.config, faseData.curso.nombre)}
                                                                                    onNoEntrega={(f) => abrirModalNoEntrega(f, bitData.config)}
                                                                                />
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ══════════════════════════════════ MODO LISTA ══════════════════════════════════ */}
                {modoVista === 'lista' && fases.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-700/50">
                                        {/* Sticky: # + Estudiante + Curso */}
                                        <th className="sticky left-0 z-10 bg-gray-50 dark:bg-gray-700/50
                                            px-4 py-3 text-left text-[11px] font-semibold text-gray-500
                                            dark:text-gray-400 uppercase tracking-wide
                                            shadow-[2px_0_4px_-1px_rgba(0,0,0,0.08)] min-w-[220px]">
                                            Estudiante
                                        </th>
                                        <th className="px-3 py-3 text-left text-[11px] font-semibold
                                            text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap">
                                            Curso
                                        </th>
                                        {/* Columnas dinámicas por bitácora */}
                                        {matrizCalificaciones.bitacoras.map(bit => {
                                            const pendientesCol = fases
                                                .flatMap(f => f.bitacoras)
                                                .find(b => b.config.id === bit.id);
                                            const hayPendiente = pendientesCol?.filas?.some(f => f.estado === 'pendiente');
                                            return (
                                                <th key={bit.id}
                                                    title={bit.nombre || `Bitácora ${bit.numero_global}`}
                                                    className={`px-3 py-3 text-center text-[11px] font-semibold
                                                        text-gray-500 dark:text-gray-400 uppercase tracking-wide
                                                        whitespace-nowrap min-w-[72px]
                                                        ${hayPendiente ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''}`}>
                                                    B{bit.numero_global}
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {matrizCalificaciones.estudiantes.map((row, rowIdx) => (
                                        <tr key={row.estudiante.id}
                                            className={rowIdx % 2 === 0 ? '' : 'bg-gray-50/50 dark:bg-gray-800/30'}>

                                            {/* Sticky: Estudiante */}
                                            <td className="sticky left-0 z-10 bg-white dark:bg-gray-800 px-4 py-2.5
                                                shadow-[2px_0_4px_-1px_rgba(0,0,0,0.08)]">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <div className="w-7 h-7 rounded-full bg-purple-500 flex-shrink-0
                                                        flex items-center justify-center overflow-hidden">
                                                        {row.estudiante.foto_url?.includes('ui-avatars') ? (
                                                            <span className="text-white text-[9px] font-bold">
                                                                {(row.estudiante.nombre_completo || '').split(' ')
                                                                    .filter(Boolean).slice(0, 2).map(p => p[0]).join('')}
                                                            </span>
                                                        ) : (
                                                            <img src={row.estudiante.foto_url}
                                                                alt={row.estudiante.nombre_completo}
                                                                className="w-full h-full object-cover" />
                                                        )}
                                                    </div>
                                                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                                                        {row.estudiante.nombre_completo}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Curso */}
                                            <td className="px-3 py-2.5">
                                                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                    {row.curso.nombre}
                                                </span>
                                            </td>

                                            {/* Celdas de bitácoras */}
                                            {matrizCalificaciones.bitacoras.map(bit => {
                                                const nota = row.notas[bit.numero_global];
                                                if (!nota) {
                                                    return (
                                                        <td key={bit.id} className="px-3 py-2.5 text-center">
                                                            <span className="text-gray-300 dark:text-gray-600">—</span>
                                                        </td>
                                                    );
                                                }
                                                if (nota.estado === 'calificada') {
                                                    return (
                                                        <td key={bit.id} className="px-3 py-2.5 text-center">
                                                            <button
                                                                onClick={() => abrirModal(
                                                                    { estudiante: row.estudiante, entrega: nota.entrega, calificacion: nota.calificacion, estado: nota.estado },
                                                                    nota.config,
                                                                    row.curso.nombre
                                                                )}
                                                                className={`text-sm font-bold hover:opacity-70 transition-opacity ${NOTA_TEXT[notaColorKey(nota.calificacion.nota)]}`}
                                                                title="Editar calificación">
                                                                {parseFloat(nota.calificacion.nota).toFixed(1)}
                                                            </button>
                                                        </td>
                                                    );
                                                }
                                                if (nota.estado === 'pendiente') {
                                                    return (
                                                        <td key={bit.id} className="px-3 py-2.5 text-center">
                                                            <button
                                                                onClick={() => abrirModal(
                                                                    { estudiante: row.estudiante, entrega: nota.entrega, calificacion: nota.calificacion, estado: nota.estado },
                                                                    nota.config,
                                                                    row.curso.nombre
                                                                )}
                                                                className="px-2 py-0.5 text-[11px] font-medium
                                                                    bg-yellow-100 dark:bg-yellow-900/30
                                                                    text-yellow-700 dark:text-yellow-300
                                                                    rounded-full hover:bg-yellow-200 transition-colors">
                                                                ⏳
                                                            </button>
                                                        </td>
                                                    );
                                                }
                                                // sin_entregar
                                                return (
                                                    <td key={bit.id} className="px-3 py-2.5 text-center">
                                                        <span className="text-gray-300 dark:text-gray-600 text-xs">—</span>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}

                                    {/* Fila promedio */}
                                    {matrizCalificaciones.estudiantes.length > 0 && (
                                        <tr className="bg-gray-50 dark:bg-gray-700/50 font-semibold">
                                            <td className="sticky left-0 z-10 bg-gray-50 dark:bg-gray-700/50
                                                px-4 py-2.5 text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wide
                                                shadow-[2px_0_4px_-1px_rgba(0,0,0,0.08)]">
                                                Promedio
                                            </td>
                                            <td className="px-3 py-2.5 text-xs text-gray-400">—</td>
                                            {matrizCalificaciones.bitacoras.map(bit => {
                                                const notas = matrizCalificaciones.estudiantes
                                                    .map(e => e.notas[bit.numero_global]?.calificacion?.nota)
                                                    .filter(n => n != null);
                                                const avg = notas.length > 0
                                                    ? (notas.reduce((a, b) => a + parseFloat(b), 0) / notas.length).toFixed(1)
                                                    : '—';
                                                return (
                                                    <td key={bit.id} className="px-3 py-2.5 text-center">
                                                        <span className={`text-xs font-bold ${avg !== '—' ? NOTA_TEXT[notaColorKey(avg)] : 'text-gray-400'}`}>
                                                            {avg}
                                                        </span>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Modales */}
            <CalificarModal
                isOpen={!!modalFila}
                onClose={cerrarModal}
                fila={modalFila}
                config={modalConfig}
                cursoNombre={modalCurso}
            />
            <NoEntregaModal
                isOpen={!!neFila}
                onClose={cerrarModalNoEntrega}
                fila={neFila}
                config={neConfig}
            />
        </DocenteLayout>
    );
}
