import { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import { createPortal } from 'react-dom';
import { LayoutList, LayoutGrid, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import EstudianteLayout from '@/Layouts/EstudianteLayout';
import BitacoraCard from './components/BitacoraCard';
import EntregarModal from './components/EntregarModal';
import DetalleModal from './components/DetalleModal';

// ── Constantes módulo ─────────────────────────────────────────────────────────

const ESTADO_ORDEN = { pendiente: 0, vencida: 1, entregada: 2, calificada: 3 };

const ESTADO_BADGE_LISTA = {
    pendiente: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
    entregada: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    calificada:'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
    vencida:   'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
};

const FASE_ESTADO_BADGE = {
    activa:      'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    planificada: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    finalizada:  'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function normFecha(s) { return s ? String(s).slice(0, 10) : ''; }
function formatFecha(s) {
    if (!s) return '—';
    const [y, m, d] = normFecha(s).split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
}

function puedeEditar(entrega, actividad) {
    if (!entrega) return false;
    if (entrega.calificacion) return false;
    if (!actividad?.fecha_finalizacion) return true;
    const fin = new Date(normFecha(actividad.fecha_finalizacion) + 'T23:59:59');
    return fin > new Date();
}

function DiasBadge({ dias, estado }) {
    if (estado === 'entregada' || estado === 'calificada') return null;
    if (estado === 'vencida' || dias === null)
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 whitespace-nowrap">Vencida</span>;
    if (dias === 0)
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 whitespace-nowrap">¡Hoy!</span>;
    if (dias <= 2)
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 whitespace-nowrap">¡{dias} días!</span>;
    if (dias <= 7)
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 whitespace-nowrap">{dias} días</span>;
    return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 whitespace-nowrap">{dias} días</span>;
}

// ── Confirmar eliminación (portal) ────────────────────────────────────────────

function ConfirmEliminarDialog({ bitacora, onConfirmar, onCancelar, procesando }) {
    if (!bitacora) return null;

    const dialog = (
        <div className="fixed inset-0 z-[10100] flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) onCancelar(); }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="relative z-[10101] w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30">
                        <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">
                        Eliminar entrega
                    </h3>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    ¿Seguro que quieres eliminar tu entrega para:
                </p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    Bitácora #{bitacora.numero_global} — {bitacora.nombre}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2 mb-5">
                    El archivo adjunto se eliminará permanentemente.
                    Podrás volver a entregar mientras el plazo esté vigente.
                </p>

                <div className="flex gap-3">
                    <button onClick={onCancelar} disabled={procesando}
                        className="flex-1 py-2.5 text-sm font-medium
                            border border-gray-200 dark:border-gray-700
                            text-gray-600 dark:text-gray-400 rounded-xl
                            hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
                            disabled:opacity-50">
                        Cancelar
                    </button>
                    <button onClick={onConfirmar} disabled={procesando}
                        className="flex-1 py-2.5 text-sm font-semibold
                            bg-red-600 hover:bg-red-700 text-white rounded-xl
                            transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {procesando ? 'Eliminando...' : '🗑️ Eliminar'}
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(dialog, document.body);
}

// ── Stats globales ────────────────────────────────────────────────────────────

function StatsBar({ fases }) {
    const totales = useMemo(() => fases.reduce((acc, f) => ({
        total:       acc.total       + f.stats.total,
        pendientes:  acc.pendientes  + f.stats.pendientes,
        entregadas:  acc.entregadas  + f.stats.entregadas,
        calificadas: acc.calificadas + f.stats.calificadas,
        vencidas:    acc.vencidas    + f.stats.vencidas,
    }), { total: 0, pendientes: 0, entregadas: 0, calificadas: 0, vencidas: 0 }), [fases]);

    const stats = [
        { label: 'Pendientes',  value: totales.pendientes,  cls: 'text-gray-700 dark:text-gray-200',   bg: 'bg-gray-50 dark:bg-gray-800/60',   icon: '⏳' },
        { label: 'Entregadas',  value: totales.entregadas,  cls: 'text-blue-700 dark:text-blue-300',   bg: 'bg-blue-50 dark:bg-blue-900/20',   icon: '📤' },
        { label: 'Calificadas', value: totales.calificadas, cls: 'text-green-700 dark:text-green-300', bg: 'bg-green-50 dark:bg-green-900/20', icon: '⭐' },
        { label: 'Vencidas',    value: totales.vencidas,    cls: 'text-red-700 dark:text-red-300',     bg: 'bg-red-50 dark:bg-red-900/20',     icon: '🔴' },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {stats.map(s => (
                <div key={s.label} className={`${s.bg} rounded-xl px-4 py-3 flex items-center gap-3`}>
                    <span className="text-xl">{s.icon}</span>
                    <div>
                        <p className={`text-xl font-bold leading-none ${s.cls}`}>{s.value}</p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{s.label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ── Acordeón de fase ──────────────────────────────────────────────────────────

function FaseAcordeon({ fase, abierta, onToggle, onEntregar, onDetalle, onEditar, onEliminar }) {
    const { stats } = fase;
    const pct = stats.total > 0 ? Math.round((stats.entregadas / stats.total) * 100) : 0;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">

            {/* Header clickeable */}
            <button
                onClick={onToggle}
                className="w-full text-left bg-purple-50 dark:bg-purple-900/20
                    px-5 py-4 flex items-start justify-between gap-4 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-800 dark:text-gray-100 text-sm">
                            Fase {fase.orden}: {fase.nombre}
                        </span>
                        <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                            Bits {fase.rango_bitacoras}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${FASE_ESTADO_BADGE[fase.estado] ?? ''}`}>
                            {fase.estado}
                        </span>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {formatFecha(fase.fecha_inicio)} → {formatFecha(fase.fecha_fin)}
                    </p>

                    {/* Barra de progreso */}
                    <div className="mt-2.5">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700">
                                <div className="h-1.5 rounded-full bg-purple-500 transition-all duration-500"
                                    style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-[11px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                {stats.entregadas}/{stats.total} entregadas
                            </span>
                        </div>
                        <div className="flex gap-3 text-[11px] text-gray-500 dark:text-gray-400">
                            {stats.calificadas > 0 && <span className="text-green-600 dark:text-green-400">✅ {stats.calificadas} cal.</span>}
                            {stats.pendientes  > 0 && <span className="text-gray-500 dark:text-gray-400">⏳ {stats.pendientes} pend.</span>}
                            {stats.vencidas    > 0 && <span className="text-red-600 dark:text-red-400">🔴 {stats.vencidas} venc.</span>}
                        </div>
                    </div>
                </div>

                <div className="shrink-0 mt-1 text-gray-400 dark:text-gray-500">
                    {abierta ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
            </button>

            {/* Contenido desplegable */}
            {abierta && (
                <div className="p-4">
                    {fase.bitacoras.length === 0 ? (
                        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
                            Sin bitácoras en esta fase.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {fase.bitacoras.map(b => (
                                <BitacoraCard
                                    key={b.id}
                                    bitacora={b}
                                    onEntregar={onEntregar}
                                    onDetalle={onDetalle}
                                    onEditar={onEditar}
                                    onEliminar={onEliminar}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Vista lista ───────────────────────────────────────────────────────────────

function VistaLista({ todasBitacoras, onEntregar, onDetalle, onEditar, onEliminar }) {
    const sorted = useMemo(() => [...todasBitacoras].sort((a, b) => {
        const oa = ESTADO_ORDEN[a.estado] ?? 9;
        const ob = ESTADO_ORDEN[b.estado] ?? 9;
        if (oa !== ob) return oa - ob;
        const da = a.dias_restantes ?? 9999;
        const db = b.dias_restantes ?? 9999;
        return da - db;
    }), [todasBitacoras]);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
                            <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">N°</th>
                            <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">Bitácora</th>
                            <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 hidden md:table-cell">Actividad</th>
                            <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 hidden lg:table-cell">Fase</th>
                            <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">Vence</th>
                            <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">Estado</th>
                            <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.map(bit => {
                            const puedeEdit = puedeEditar(bit.entrega, bit.actividad);
                            return (
                                <tr key={bit.id}
                                    className="border-b border-gray-50 dark:border-gray-700/60 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">

                                    {/* N° */}
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg
                                            bg-purple-100 dark:bg-purple-900/40
                                            text-purple-700 dark:text-purple-300 text-xs font-bold">
                                            {bit.numero_global}
                                        </span>
                                    </td>

                                    {/* Bitácora */}
                                    <td className="px-4 py-3">
                                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 max-w-[160px] truncate">
                                            {bit.nombre}
                                        </p>
                                    </td>

                                    {/* Actividad */}
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        {bit.actividad ? (
                                            <p className="text-xs text-gray-600 dark:text-gray-400 max-w-[180px] truncate">
                                                {bit.actividad.titulo}
                                            </p>
                                        ) : (
                                            <span className="text-xs text-gray-300 dark:text-gray-600 italic">Sin actividad</span>
                                        )}
                                    </td>

                                    {/* Fase */}
                                    <td className="px-4 py-3 hidden lg:table-cell">
                                        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            {bit.faseNombre}
                                        </span>
                                    </td>

                                    {/* Vence */}
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col gap-1">
                                            {bit.actividad?.fecha_entrega ? (
                                                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                    {formatFecha(bit.actividad.fecha_entrega)}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
                                            )}
                                            <DiasBadge dias={bit.dias_restantes} estado={bit.estado} />
                                        </div>
                                    </td>

                                    {/* Estado */}
                                    <td className="px-4 py-3">
                                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${ESTADO_BADGE_LISTA[bit.estado]}`}>
                                            {bit.estado === 'calificada' && bit.entrega?.calificacion?.nota
                                                ? `★ ${parseFloat(bit.entrega.calificacion.nota).toFixed(1)}`
                                                : bit.estado === 'pendiente'  ? 'Pendiente'
                                                : bit.estado === 'entregada'  ? 'Entregada'
                                                : bit.estado === 'calificada' ? 'Calificada'
                                                : 'Vencida'}
                                        </span>
                                    </td>

                                    {/* Acción */}
                                    <td className="px-4 py-3 text-right">
                                        {bit.estado === 'pendiente' && bit.actividad && (
                                            <button onClick={() => onEntregar(bit)}
                                                className="px-3 py-1.5 text-xs font-semibold rounded-lg
                                                    bg-purple-600 hover:bg-purple-700 text-white transition-colors whitespace-nowrap">
                                                📤 Entregar
                                            </button>
                                        )}

                                        {bit.estado === 'entregada' && puedeEdit && (
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button onClick={() => onDetalle(bit)}
                                                    title="Ver entrega"
                                                    className="px-2.5 py-1.5 text-xs font-semibold rounded-lg
                                                        border border-purple-300 dark:border-purple-700
                                                        text-purple-700 dark:text-purple-300
                                                        hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                                                    👁️
                                                </button>
                                                <button onClick={() => onEditar(bit)}
                                                    title="Editar entrega"
                                                    className="px-2.5 py-1.5 text-xs rounded-lg
                                                        border border-blue-300 dark:border-blue-700
                                                        text-blue-700 dark:text-blue-300
                                                        hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                                    ✏️
                                                </button>
                                                <button onClick={() => onEliminar(bit)}
                                                    title="Eliminar entrega"
                                                    className="px-2.5 py-1.5 text-xs rounded-lg
                                                        border border-red-300 dark:border-red-700
                                                        text-red-600 dark:text-red-400
                                                        hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                                    🗑️
                                                </button>
                                            </div>
                                        )}

                                        {(bit.estado === 'calificada' || (bit.estado === 'entregada' && !puedeEdit)) && (
                                            <button onClick={() => onDetalle(bit)}
                                                className="px-3 py-1.5 text-xs font-semibold rounded-lg
                                                    border border-purple-300 dark:border-purple-700
                                                    text-purple-700 dark:text-purple-300
                                                    hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors whitespace-nowrap">
                                                {bit.estado === 'calificada' ? '👁️ Ver nota' : '👁️ Ver entrega'}
                                            </button>
                                        )}

                                        {bit.estado === 'vencida' && (
                                            <span className="text-xs text-gray-400 dark:text-gray-500 italic">Vencida</span>
                                        )}
                                        {bit.estado === 'pendiente' && !bit.actividad && (
                                            <span className="text-xs text-gray-300 dark:text-gray-600 italic">—</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {sorted.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400 dark:text-gray-500">
                                    No hay bitácoras registradas aún.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function CronogramaIndex({ fases, periodoActivo, sinMatricula, curso }) {
    const [vista, setVista] = useState(() =>
        localStorage.getItem('est-cronograma-vista') || 'fases'
    );
    const [fasesAbiertas, setFasesAbiertas] = useState(() =>
        Object.fromEntries((fases || []).map(f => [f.id, f.orden === 1]))
    );
    const [modalEntregar,   setModalEntregar]   = useState(null);
    const [modalDetalle,    setModalDetalle]    = useState(null);
    const [confirmEliminar, setConfirmEliminar] = useState(null);
    const [eliminando,      setEliminando]      = useState(false);

    const cambiarVista = (v) => {
        setVista(v);
        localStorage.setItem('est-cronograma-vista', v);
    };

    const toggleFase = (id) =>
        setFasesAbiertas(prev => ({ ...prev, [id]: !prev[id] }));

    const abrirDetalle = (bit) =>
        setModalDetalle({ bitacora: bit, modoInicial: 'ver' });

    const abrirEditar = (bit) =>
        setModalDetalle({ bitacora: bit, modoInicial: 'editar' });

    const abrirEliminar = (bit) =>
        setConfirmEliminar(bit);

    const cerrarDetalle = () =>
        setModalDetalle(null);

    const handleEliminar = () => {
        if (!confirmEliminar) return;
        setEliminando(true);
        router.delete(route('estudiante.cronograma.eliminar', confirmEliminar.entrega.id), {
            onSuccess: () => {
                setConfirmEliminar(null);
                setModalDetalle(null);
            },
            onFinish: () => setEliminando(false),
        });
    };

    // Cuando DetalleModal dispara eliminar desde dentro del modal
    const handleEliminarDesdModal = (bit) => {
        cerrarDetalle();
        setConfirmEliminar(bit);
    };

    // Aplanar todas las bitácoras con nombre de fase para vista lista
    const todasBitacoras = useMemo(() =>
        (fases || []).flatMap(f =>
            f.bitacoras.map(b => ({ ...b, faseNombre: f.nombre }))
        ), [fases]);

    if (sinMatricula) {
        return (
            <EstudianteLayout title="Mi Cronograma">
                <Head title="Cronograma" />
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

    return (
        <EstudianteLayout title="Mi Cronograma">
            <Head title="Cronograma" />

            {/* Header */}
            <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Mi Cronograma</h1>
                    {curso && periodoActivo && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            {curso.nombre} · {periodoActivo.nombre}
                        </p>
                    )}
                </div>

                {/* Toggle vista */}
                <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-700/60 rounded-xl self-start sm:self-auto">
                    <button
                        onClick={() => cambiarVista('lista')}
                        title="Vista lista"
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                            ${vista === 'lista'
                                ? 'bg-white dark:bg-gray-700 text-purple-700 dark:text-purple-300 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}>
                        <LayoutList size={14} />
                        Lista
                    </button>
                    <button
                        onClick={() => cambiarVista('fases')}
                        title="Vista por fases"
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                            ${vista === 'fases'
                                ? 'bg-white dark:bg-gray-700 text-purple-700 dark:text-purple-300 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}>
                        <LayoutGrid size={14} />
                        Por Fases
                    </button>
                </div>
            </div>

            {/* Stats */}
            <StatsBar fases={fases || []} />

            {/* Contenido */}
            {vista === 'lista' ? (
                <VistaLista
                    todasBitacoras={todasBitacoras}
                    onEntregar={setModalEntregar}
                    onDetalle={abrirDetalle}
                    onEditar={abrirEditar}
                    onEliminar={abrirEliminar}
                />
            ) : (
                <div className="flex flex-col gap-4">
                    {(fases || []).map(fase => (
                        <FaseAcordeon
                            key={fase.id}
                            fase={fase}
                            abierta={!!fasesAbiertas[fase.id]}
                            onToggle={() => toggleFase(fase.id)}
                            onEntregar={setModalEntregar}
                            onDetalle={abrirDetalle}
                            onEditar={abrirEditar}
                            onEliminar={abrirEliminar}
                        />
                    ))}
                    {(!fases || fases.length === 0) && (
                        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
                            <p className="text-4xl mb-3">📭</p>
                            <p className="text-sm">No hay fases configuradas para este período.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modales */}
            <EntregarModal
                isOpen={!!modalEntregar}
                onClose={() => setModalEntregar(null)}
                bitacora={modalEntregar}
            />
            <DetalleModal
                isOpen={!!modalDetalle}
                onClose={cerrarDetalle}
                bitacora={modalDetalle?.bitacora ?? null}
                modoInicial={modalDetalle?.modoInicial ?? 'ver'}
                onEliminar={handleEliminarDesdModal}
            />
            <ConfirmEliminarDialog
                bitacora={confirmEliminar}
                onConfirmar={handleEliminar}
                onCancelar={() => setConfirmEliminar(null)}
                procesando={eliminando}
            />
        </EstudianteLayout>
    );
}
