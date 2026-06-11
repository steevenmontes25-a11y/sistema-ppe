import { useState } from 'react';
import { createPortal } from 'react-dom';

// ── Constantes ────────────────────────────────────────────────────────────────

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const ESTADO_CONFIG = {
    presente:    { bg: 'bg-green-500',  text: 'text-white', simbolo: '✓', label: 'Presente'    },
    ausente:     { bg: 'bg-red-500',    text: 'text-white', simbolo: '✗', label: 'Ausente'     },
    tardanza:    { bg: 'bg-yellow-400', text: 'text-gray-900', simbolo: 'T', label: 'Tardanza' },
    justificado: { bg: 'bg-blue-500',   text: 'text-white', simbolo: 'J', label: 'Justificado' },
};

const LEYENDA = [
    { estado: 'presente',    color: 'bg-green-500' },
    { estado: 'ausente',     color: 'bg-red-500' },
    { estado: 'tardanza',    color: 'bg-yellow-400' },
    { estado: 'justificado', color: 'bg-blue-500' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function nombreMes(mes, anio) {
    return new Date(anio, mes - 1, 1).toLocaleDateString('es', {
        month: 'long', year: 'numeric',
    });
}

function capitalize(s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function hoyStr() {
    const h = new Date();
    return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, '0')}-${String(h.getDate()).padStart(2, '0')}`;
}

// ── Popover ───────────────────────────────────────────────────────────────────

function Popover({ data, top, left, onClose }) {
    if (!data) return null;

    const cfg = ESTADO_CONFIG[data.estado] ?? {};

    const popover = (
        <>
            {/* Backdrop invisible */}
            <div className="fixed inset-0 z-[9998]" onClick={onClose} />
            <div
                className="fixed z-[9999] w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl
                    border border-gray-200 dark:border-gray-700 p-4"
                style={{ top: top + 4, left: Math.min(left, window.innerWidth - 272) }}>
                <div className="flex items-center gap-2 mb-3">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${cfg.bg} ${cfg.text}`}>
                        {cfg.simbolo}
                    </span>
                    <div>
                        <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">{cfg.label}</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">{data.fecha}</p>
                    </div>
                </div>
                {data.observacion && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/60 rounded-lg px-3 py-2 mb-2 italic">
                        "{data.observacion}"
                    </p>
                )}
                {data.registrado_por && (
                    <p className="text-[11px] text-gray-400 dark:text-gray-500">
                        Registrado por: Prof. {data.registrado_por}
                    </p>
                )}
            </div>
        </>
    );

    return createPortal(popover, document.body);
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function CalendarioMes({ asistenciasMes, mesFiltro, anioFiltro }) {
    const [popover, setPopover] = useState(null);

    // Mapa fecha → asistencia para O(1)
    const mapaAsistencias = Object.fromEntries(
        asistenciasMes.map(a => [a.fecha, a])
    );

    // Construcción del grid
    const diasEnMes   = new Date(anioFiltro, mesFiltro, 0).getDate();
    const primerDia   = new Date(anioFiltro, mesFiltro - 1, 1);
    const inicioGrid  = (primerDia.getDay() + 6) % 7; // 0=Lun
    const totalCeldas = Math.ceil((inicioGrid + diasEnMes) / 7) * 7;
    const hoy         = hoyStr();

    const handleDiaClick = (e, dia, asistencia) => {
        if (!asistencia) return;
        const rect = e.currentTarget.getBoundingClientRect();
        setPopover({
            ...asistencia,
            top:  rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
        });
    };

    // Stats del mes
    const totalMes    = asistenciasMes.length;
    const presenteMes = asistenciasMes.filter(a => a.estado === 'presente').length;
    const ausenteMes  = asistenciasMes.filter(a => a.estado === 'ausente').length;
    const tardanzaMes = asistenciasMes.filter(a => a.estado === 'tardanza').length;
    const pctMes      = totalMes > 0 ? Math.round(presenteMes / totalMes * 100) : 0;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm mb-6">
            {/* Header mes */}
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 text-center">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-base">
                    {capitalize(nombreMes(mesFiltro, anioFiltro))}
                </h3>
                {totalMes > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {totalMes} registro{totalMes !== 1 ? 's' : ''} este mes · {pctMes}% asistencia
                    </p>
                )}
            </div>

            {/* Grid */}
            <div className="p-4">
                {/* Cabeceras días */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                    {DIAS_SEMANA.map(d => (
                        <div key={d} className="text-center text-[11px] font-bold uppercase tracking-wide
                            text-gray-400 dark:text-gray-500 py-1">
                            {d}
                        </div>
                    ))}
                </div>

                {/* Celdas */}
                <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: totalCeldas }).map((_, idx) => {
                        const dia = idx - inicioGrid + 1;
                        const esDiaMes = dia >= 1 && dia <= diasEnMes;
                        if (!esDiaMes) return <div key={idx} />;

                        const fechaStr = `${anioFiltro}-${String(mesFiltro).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
                        const asistencia = mapaAsistencias[fechaStr];
                        const cfg = asistencia ? ESTADO_CONFIG[asistencia.estado] : null;
                        const esHoy = fechaStr === hoy;

                        return (
                            <div
                                key={idx}
                                onClick={e => handleDiaClick(e, dia, asistencia)}
                                className={`min-h-[70px] rounded-xl border flex flex-col items-center justify-center relative transition-colors
                                    ${asistencia
                                        ? 'cursor-pointer hover:opacity-80'
                                        : 'cursor-default'
                                    }
                                    ${esHoy && !asistencia
                                        ? 'border-purple-400 dark:border-purple-500'
                                        : 'border-gray-100 dark:border-gray-700'
                                    }
                                    bg-gray-50/50 dark:bg-gray-700/30`}>

                                {/* Número del día */}
                                <span className={`absolute top-1.5 right-2 text-[11px] font-bold
                                    ${esHoy
                                        ? 'text-purple-600 dark:text-purple-400'
                                        : 'text-gray-400 dark:text-gray-500'
                                    }`}>
                                    {dia}
                                </span>

                                {/* Círculo de estado */}
                                {cfg && (
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center
                                        text-base font-bold mt-2 ${cfg.bg} ${cfg.text} shadow-sm`}>
                                        {cfg.simbolo}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Leyenda */}
                <div className="flex items-center justify-center flex-wrap gap-4 mt-4 pt-3
                    border-t border-gray-100 dark:border-gray-700">
                    {LEYENDA.map(l => (
                        <div key={l.estado} className="flex items-center gap-1.5">
                            <span className={`w-3 h-3 rounded-full ${l.color}`} />
                            <span className="text-[11px] text-gray-500 dark:text-gray-400 capitalize">
                                {ESTADO_CONFIG[l.estado].label}
                            </span>
                        </div>
                    ))}
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-500" />
                        <span className="text-[11px] text-gray-500 dark:text-gray-400">Sin registro</span>
                    </div>
                </div>
            </div>

            {/* Stats del mes — pie */}
            {totalMes > 0 && (
                <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        Este mes:&nbsp;
                        <span className="text-green-600 dark:text-green-400 font-bold">✅ {presenteMes}</span>
                        &nbsp;·&nbsp;
                        <span className="text-red-600 dark:text-red-400 font-bold">❌ {ausenteMes}</span>
                        &nbsp;·&nbsp;
                        <span className="text-yellow-600 dark:text-yellow-400 font-bold">⏰ {tardanzaMes}</span>
                        &nbsp;·&nbsp;
                        <span className="font-semibold text-gray-700 dark:text-gray-300">{pctMes}% asistencia</span>
                    </p>
                </div>
            )}

            {totalMes === 0 && (
                <div className="px-5 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
                    No hay registros de asistencia para este mes.
                </div>
            )}

            {/* Popover */}
            {popover && (
                <Popover
                    data={popover}
                    top={popover.top}
                    left={popover.left}
                    onClose={() => setPopover(null)}
                />
            )}
        </div>
    );
}
