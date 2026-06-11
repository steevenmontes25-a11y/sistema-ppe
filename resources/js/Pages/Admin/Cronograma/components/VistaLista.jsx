import { useState } from 'react';
import { router } from '@inertiajs/react';
import {
    ChevronDown, ChevronRight, CalendarOff, Edit2, Trash2,
    Settings, AlertTriangle,
} from 'lucide-react';
import BitacoraConfigModal from './BitacoraConfigModal';

const TIPO_COLORS = {
    pdf:   'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    foto:  'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
    texto: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
    mixto: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
};
const ESTADO_ACT_COLORS = {
    borrador: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
    activa:   'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
    cerrada:  'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300',
};
const ESTADO_BIT_COLORS = {
    pendiente: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
    activa:    'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
    cerrada:   'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300',
};

const fmt = (fecha) => {
    if (!fecha) return '—';
    const s = String(fecha).split('T')[0];
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es-EC', {
        day: '2-digit', month: 'short', year: '2-digit',
    });
};

export default function VistaLista({ fases, totalEstudiantes, onEditar, periodoNombre, cursoNombre, onCrearPrimera }) {
    const [colapsadas,       setColapsadas]       = useState({});
    const [tabActivo,        setTabActivo]        = useState({}); // { [faseId]: 'actividades' | 'bitacoras' }
    const [bitacoraEditando, setBitacoraEditando] = useState(null);
    const [actsFaseModal,    setActsFaseModal]    = useState([]);

    const toggleFase = (id) => setColapsadas(prev => ({ ...prev, [id]: !prev[id] }));
    const getTab     = (id) => tabActivo[id] || 'actividades';
    const setTab     = (id, tab) => setTabActivo(prev => ({ ...prev, [id]: tab }));

    const abrirBitacora  = (bitacora, actividades) => { setBitacoraEditando(bitacora); setActsFaseModal(actividades || []); };
    const cerrarBitacora = () => { setBitacoraEditando(null); setActsFaseModal([]); };

    const eliminar = (act) => {
        if (!confirm(`¿Eliminar "${act.titulo}"?\n\nEsta acción no se puede deshacer.`)) return;
        router.delete(route('admin.cronograma.destroy', act.id), { preserveScroll: true });
    };

    // Empty state
    if (!fases || fases.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-center px-6">
                <CalendarOff className="text-gray-300 dark:text-gray-600 mb-4" size={52} />
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    No hay actividades para {cursoNombre || 'este curso'}
                    {periodoNombre ? ` en el período ${periodoNombre}` : ''}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                    Crea fases PPE primero y luego agrega actividades al cronograma.
                </p>
                <div className="flex items-center gap-3">
                    <button onClick={onCrearPrimera}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors font-medium">
                        + Crear primera actividad
                    </button>
                    <a href="/admin/fases"
                        className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors">
                        <Settings size={14} /> Gestionar Fases PPE
                    </a>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Modal de bitácora config — siempre montado, visibilidad por isOpen */}
            <BitacoraConfigModal
                isOpen={!!bitacoraEditando}
                bitacora={bitacoraEditando}
                actividades={actsFaseModal}
                onClose={cerrarBitacora}
            />

            <div className="space-y-4">
                {fases.map(fase => {
                    const colapsada = colapsadas[fase.id] ?? false;
                    const totalActs = fase.actividades?.length ?? 0;
                    const totalBits = fase.bitacoras_config?.length ?? 0;
                    const tabActual = getTab(fase.id);

                    return (
                        <div key={fase.id}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">

                            {/* ── Encabezado de fase — colapsable ── */}
                            <button onClick={() => toggleFase(fase.id)}
                                className="w-full flex items-center gap-3 px-5 py-4
                                    bg-purple-50 dark:bg-purple-900/30
                                    border-b border-purple-100 dark:border-purple-800/50
                                    hover:bg-purple-100 dark:hover:bg-purple-900/50
                                    transition-colors text-left">
                                {colapsada
                                    ? <ChevronRight size={18} className="text-purple-500 dark:text-purple-400 shrink-0" />
                                    : <ChevronDown  size={18} className="text-purple-500 dark:text-purple-400 shrink-0" />}
                                <span className="font-semibold text-purple-900 dark:text-purple-200 flex-1">{fase.nombre}</span>
                                <span className="text-xs font-medium bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-2.5 py-1 rounded-full shrink-0">
                                    {totalActs} {totalActs === 1 ? 'actividad' : 'actividades'}
                                </span>
                                <span className="text-xs font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-full shrink-0">
                                    Bitácoras {(fase.orden - 1) * 5 + 1}–{fase.orden * 5}
                                </span>
                            </button>

                            {/* ── Contenido expandido ── */}
                            {!colapsada && (
                                <>
                                    {/* Tabs internos */}
                                    <div className="flex border-b border-gray-100 dark:border-gray-700 px-5 gap-0">
                                        {[
                                            { key: 'actividades', label: 'Actividades' },
                                            { key: 'bitacoras',   label: 'Bitácoras' },
                                        ].map(({ key, label }) => (
                                            <button key={key}
                                                onClick={() => setTab(fase.id, key)}
                                                className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px
                                                    ${tabActual === key
                                                        ? 'border-purple-600 text-purple-700 dark:text-purple-300'
                                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                                    }`}>
                                                {label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* ══ TAB: ACTIVIDADES ══ */}
                                    {tabActual === 'actividades' && (
                                        <div className="overflow-x-auto">
                                            {totalActs === 0 ? (
                                                <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-10">
                                                    Sin actividades en esta fase
                                                </p>
                                            ) : (
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                                                            {['#', 'Título', 'Tipo', 'Inicio', 'Entrega', 'Cierre', 'Puntaje', 'Entregas', 'Estado', 'Acciones'].map(h => (
                                                                <th key={h}
                                                                    className={`px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider
                                                                        ${h === 'Puntaje' || h === '#' ? 'text-right' : h === 'Entregas' || h === 'Estado' || h === 'Acciones' ? 'text-center' : 'text-left'}`}>
                                                                    {h}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                                        {fase.actividades.map((act, idx) => (
                                                            <tr key={act.id}
                                                                className="bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                                                                <td className="px-4 py-3 text-right text-gray-400 dark:text-gray-500 text-xs">{idx + 1}</td>
                                                                <td className="px-4 py-3 max-w-[200px]">
                                                                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{act.titulo}</p>
                                                                    {act.descripcion && (
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{act.descripcion}</p>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${TIPO_COLORS[act.tipo_entrega] || ''}`}>
                                                                        {act.tipo_entrega?.toUpperCase()}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap text-xs">{fmt(act.fecha_inicio)}</td>
                                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap text-xs">{fmt(act.fecha_entrega)}</td>
                                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap text-xs">{fmt(act.fecha_finalizacion)}</td>
                                                                <td className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-200">{act.puntaje_maximo}</td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <span className="font-medium text-gray-700 dark:text-gray-200">{act.bitacoras_count}</span>
                                                                    <span className="text-gray-400 dark:text-gray-500"> / {totalEstudiantes}</span>
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium capitalize ${ESTADO_ACT_COLORS[act.estado] || ''}`}>
                                                                        {act.estado}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <div className="flex items-center justify-center gap-1">
                                                                        <button onClick={() => onEditar(act)} title="Editar"
                                                                            className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors">
                                                                            <Edit2 size={14} />
                                                                        </button>
                                                                        <button onClick={() => eliminar(act)} title="Eliminar"
                                                                            className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                                                            <Trash2 size={14} />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    )}

                                    {/* ══ TAB: BITÁCORAS ══ */}
                                    {tabActual === 'bitacoras' && (
                                        <div className="overflow-x-auto">
                                            {/* Header de sección con rango global */}
                                            <div className="flex items-center justify-between px-4 py-2 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-100 dark:border-purple-800">
                                                <span className="text-sm font-semibold text-purple-800 dark:text-purple-200">
                                                    Bitácoras {(fase.orden - 1) * 5 + 1} — {fase.orden * 5}
                                                </span>
                                                <span className="text-xs text-purple-500 dark:text-purple-400">
                                                    {fase.nombre}
                                                </span>
                                            </div>
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b border-gray-100 dark:border-gray-700 bg-purple-50 dark:bg-purple-900/20">
                                                        {['#', 'Nombre', 'Actividad vinculada', 'Entregas', 'Estado', 'Acciones'].map(h => (
                                                            <th key={h}
                                                                className={`px-4 py-3 text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider
                                                                    ${h === '#' ? 'text-center w-12' : h === 'Entregas' || h === 'Estado' || h === 'Acciones' ? 'text-center' : 'text-left'}`}>
                                                                {h}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                                    {(fase.bitacoras_config || []).map(bit => {
                                                        const pct = totalEstudiantes > 0
                                                            ? Math.round((bit.entregas_count / totalEstudiantes) * 100)
                                                            : 0;
                                                        return (
                                                            <tr key={bit.id}
                                                                className="bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors">

                                                                {/* Número global */}
                                                                <td className="px-4 py-3 text-center">
                                                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-sm font-bold">
                                                                        {bit.numero_global}
                                                                    </span>
                                                                </td>

                                                                {/* Nombre */}
                                                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                                                                    {bit.nombre}
                                                                </td>

                                                                {/* Actividad vinculada */}
                                                                <td className="px-4 py-3 max-w-[220px]">
                                                                    {bit.actividad ? (
                                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 text-xs font-medium truncate max-w-full">
                                                                            {bit.actividad.titulo}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
                                                                            <AlertTriangle size={12} />
                                                                            Sin vincular
                                                                        </span>
                                                                    )}
                                                                </td>

                                                                {/* Entregas + barra de progreso */}
                                                                <td className="px-4 py-3 text-center min-w-[100px]">
                                                                    {bit.actividad ? (
                                                                        <div>
                                                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                                                                                {bit.entregas_count}
                                                                            </span>
                                                                            <span className="text-xs text-gray-400 dark:text-gray-500"> / {totalEstudiantes}</span>
                                                                            <div className="w-full h-1.5 bg-purple-200 dark:bg-purple-900/40 rounded-full mt-1.5">
                                                                                <div
                                                                                    className="h-1.5 bg-purple-600 rounded-full transition-all"
                                                                                    style={{ width: `${pct}%` }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                                                                    )}
                                                                </td>

                                                                {/* Estado */}
                                                                <td className="px-4 py-3 text-center">
                                                                    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium capitalize ${ESTADO_BIT_COLORS[bit.estado] || ''}`}>
                                                                        {bit.estado}
                                                                    </span>
                                                                </td>

                                                                {/* Acciones — solo editar (las 5 bitácoras son fijas) */}
                                                                <td className="px-4 py-3 text-center">
                                                                    <button
                                                                        onClick={() => abrirBitacora(bit, fase.actividades)}
                                                                        title="Editar bitácora"
                                                                        className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors">
                                                                        <Edit2 size={14} />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>

                                            {/* Pie informativo */}
                                            <p className="px-5 py-3 text-xs text-gray-400 dark:text-gray-500 border-t border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                                                5 bitácoras por fase con numeración global continua. Vincúlalas a actividades del cronograma para que los estudiantes puedan entregarlas.
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </>
    );
}
