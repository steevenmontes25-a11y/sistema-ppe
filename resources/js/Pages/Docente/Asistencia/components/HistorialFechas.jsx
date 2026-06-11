import { router } from '@inertiajs/react';
import { Calendar } from 'lucide-react';

function normFecha(fechaStr) {
    if (!fechaStr) return '';
    return String(fechaStr).slice(0, 10);
}

function formatFecha(fechaStr) {
    if (!fechaStr) return '—';
    const [y, m, d] = normFecha(fechaStr).split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('es', { weekday: 'short', day: '2-digit', month: 'short' });
}

export default function HistorialFechas({ fechas, fechaActual, cursoId }) {
    if (!fechas || fechas.length === 0) return null;

    const verFecha = (fecha) => {
        const params = { fecha: normFecha(fecha) };
        if (cursoId) params.curso_id = cursoId;
        router.get(route('docente.asistencia.index'), params);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <Calendar size={15} className="text-purple-600 dark:text-purple-400" />
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Últimas fechas registradas
                </h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-72 overflow-y-auto">
                {fechas.map((f, i) => {
                    const esActual = normFecha(f.fecha) === normFecha(fechaActual);
                    return (
                        <div key={i}
                            className={`flex items-center justify-between px-4 py-2.5 transition-colors
                                ${esActual
                                    ? 'bg-purple-50 dark:bg-purple-900/20'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                }`}>
                            <div className="flex items-center gap-3">
                                <span className={`text-sm font-medium capitalize
                                    ${esActual
                                        ? 'text-purple-700 dark:text-purple-300'
                                        : 'text-gray-700 dark:text-gray-300'
                                    }`}>
                                    {formatFecha(f.fecha)}
                                </span>
                                <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[10px] rounded-full">
                                    {f.total} est.
                                </span>
                                {esActual && (
                                    <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[10px] font-semibold rounded-full">
                                        actual
                                    </span>
                                )}
                            </div>
                            {!esActual && (
                                <button onClick={() => verFecha(f.fecha)}
                                    className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-medium px-2 py-1">
                                    Ver
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
