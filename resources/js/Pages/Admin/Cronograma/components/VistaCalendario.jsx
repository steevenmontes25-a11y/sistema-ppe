import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const NOMBRES_DIAS  = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
const NOMBRES_MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/** Compara dos Date ignorando la hora (zona local) */
const mismaFecha = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth()    === d2.getMonth()    &&
    d1.getDate()     === d2.getDate();

/** Convierte un string YYYY-MM-DD en Date local (sin desplazamiento UTC) */
const parseFecha = (str) => {
    if (!str) return null;
    const s = String(str).split('T')[0];
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
};

/** Construye el string YYYY-MM-DD de un Date local */
const toDateStr = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/**
 * Construye el array de celdas para el mes dado.
 * Semana empieza en lunes (index 0).
 */
function construirCeldas(year, month) {
    const primerDia = new Date(year, month, 1);

    // getDay(): 0=domingo … 6=sábado → convertir a lunes=0 … domingo=6
    let diaSemana = primerDia.getDay();
    diaSemana = diaSemana === 0 ? 6 : diaSemana - 1;

    const diasEnMes = new Date(year, month + 1, 0).getDate();
    const celdas    = [];

    // Días del mes anterior para rellenar el inicio
    for (let i = diaSemana - 1; i >= 0; i--) {
        celdas.push({ fecha: new Date(year, month, -i), esOtroMes: true });
    }

    // Días del mes actual
    for (let d = 1; d <= diasEnMes; d++) {
        celdas.push({ fecha: new Date(year, month, d), esOtroMes: false });
    }

    // Completar la última semana con días del mes siguiente
    while (celdas.length % 7 !== 0) {
        const n = celdas.length - diasEnMes - diaSemana + 1;
        celdas.push({ fecha: new Date(year, month + 1, n), esOtroMes: true });
    }

    return celdas;
}

export default function VistaCalendario({ actividades, onEditar, onCrearEnFecha }) {
    const hoy = new Date();
    const [mes,  setMes]  = useState(hoy.getMonth());
    const [anio, setAnio] = useState(hoy.getFullYear());

    const irMesAnterior = () => {
        if (mes === 0) { setMes(11); setAnio(a => a - 1); }
        else           { setMes(m => m - 1); }
    };

    const irMesSiguiente = () => {
        if (mes === 11) { setMes(0); setAnio(a => a + 1); }
        else            { setMes(m => m + 1); }
    };

    const celdas = construirCeldas(anio, mes);

    // Índice actividades por fecha_entrega (string YYYY-MM-DD)
    const actsPorFecha = {};
    (actividades || []).forEach(act => {
        const f = parseFecha(act.fecha_entrega);
        if (!f) return;
        const key = toDateStr(f);
        (actsPorFecha[key] = actsPorFecha[key] || []).push(act);
    });

    const handleCeldaClick = (fecha, actsDelDia) => {
        // Clic en celda sin actividades → crear nueva con fecha prellenada
        if (actsDelDia.length === 0 && onCrearEnFecha) {
            onCrearEnFecha(toDateStr(fecha));
        }
    };

    return (
        <div className="w-full min-w-0 overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">

            {/* ── Navegación mes ── */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                <button onClick={irMesAnterior}
                    className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
                    <ChevronLeft size={18} />
                </button>

                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                    {NOMBRES_MESES[mes]} {anio}
                </h3>

                <button onClick={irMesSiguiente}
                    className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
                    <ChevronRight size={18} />
                </button>
            </div>

            {/* ── Cabecera de días ── */}
            <div className="grid grid-cols-7 w-full border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                {NOMBRES_DIAS.map(dia => (
                    <div key={dia} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">
                        {dia}
                    </div>
                ))}
            </div>

            {/* ── Grid de días ── */}
            <div className="grid grid-cols-7 w-full">
                {celdas.map((celda, idx) => {
                    const key       = toDateStr(celda.fecha);
                    const acts      = actsPorFecha[key] || [];
                    const esHoy     = mismaFecha(celda.fecha, hoy);
                    const esUltCol  = (idx + 1) % 7 === 0;
                    const esUltFila = idx >= celdas.length - 7;

                    return (
                        <div key={idx}
                            onClick={() => handleCeldaClick(celda.fecha, acts)}
                            className={[
                                'min-h-[90px] p-1 w-full min-w-0 overflow-hidden',
                                'border-b border-r',
                                'border-gray-100 dark:border-gray-700',
                                esUltCol  ? 'border-r-0' : '',
                                esUltFila ? 'border-b-0' : '',
                                celda.esOtroMes
                                    ? 'bg-gray-50 dark:bg-gray-900/60'
                                    : 'bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/20',
                                acts.length === 0 && !celda.esOtroMes ? 'cursor-pointer' : '',
                            ].join(' ')}
                        >
                            {/* Número del día */}
                            <div className="flex justify-end mb-1">
                                <span className={[
                                    'inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium',
                                    esHoy
                                        ? 'bg-purple-600 text-white'
                                        : celda.esOtroMes
                                            ? 'text-gray-400 dark:text-gray-600'
                                            : 'text-gray-700 dark:text-gray-300',
                                ].join(' ')}>
                                    {celda.fecha.getDate()}
                                </span>
                            </div>

                            {/* Actividades del día */}
                            {acts.length > 0 && (
                                <>
                                    {/* Móvil: solo punto de color */}
                                    <div className="flex sm:hidden justify-center">
                                        <div className="w-2 h-2 rounded-full bg-purple-600" />
                                    </div>

                                    {/* Desktop: chips */}
                                    <div className="hidden sm:flex flex-col gap-0.5 mt-1 w-full min-w-0">
                                        {acts.slice(0, 2).map(act => (
                                            <button
                                                key={act.id}
                                                onClick={e => { e.stopPropagation(); onEditar(act); }}
                                                title={act.titulo}
                                                className="w-full truncate text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full mb-0.5 cursor-pointer hover:bg-purple-700 transition-colors"
                                            >
                                                {act.titulo}
                                            </button>
                                        ))}
                                        {acts.length > 2 && (
                                            <span className="text-[10px] text-gray-400 dark:text-gray-500 pl-1 select-none">
                                                +{acts.length - 2} más
                                            </span>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
