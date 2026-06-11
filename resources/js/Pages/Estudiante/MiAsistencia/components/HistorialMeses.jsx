// ── Helpers ───────────────────────────────────────────────────────────────────

function colorPct(pct) {
    if (pct >= 90) return { text: 'text-green-600 dark:text-green-400', bar: 'bg-green-500' };
    if (pct >= 75) return { text: 'text-blue-600 dark:text-blue-400',   bar: 'bg-blue-500'  };
    if (pct >= 60) return { text: 'text-yellow-600 dark:text-yellow-400', bar: 'bg-yellow-400' };
    return              { text: 'text-red-600 dark:text-red-400',       bar: 'bg-red-500'   };
}

function badgePct(pct) {
    if (pct >= 90) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
    if (pct >= 75) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
    if (pct >= 60) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
    return              'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
}

function labelPct(pct) {
    if (pct >= 90) return 'Excelente';
    if (pct >= 75) return 'Regular';
    if (pct >= 60) return 'En riesgo';
    return              'Crítico';
}

function capitalize(s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function HistorialMeses({ porMes, stats, mesFiltro, anioFiltro }) {
    if (!porMes || porMes.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 text-center shadow-sm">
                <p className="text-sm text-gray-400 dark:text-gray-500">
                    No hay registros de asistencia en este período aún.
                </p>
            </div>
        );
    }

    const mesActualStr = `${anioFiltro}-${String(mesFiltro).padStart(2, '0')}`;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
            {/* Título */}
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm">
                    Historial por mes
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Resumen de asistencia por cada mes del período
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60">
                            <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">Mes</th>
                            <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-green-500">Presente</th>
                            <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-red-500">Ausente</th>
                            <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-yellow-500 hidden sm:table-cell">Tardanza</th>
                            <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-blue-500 hidden md:table-cell">Justificado</th>
                            <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">Total</th>
                            <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">%</th>
                            <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 hidden sm:table-cell">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {porMes.map(m => {
                            const esMesActual = m.mes === mesActualStr;
                            const { text, bar } = colorPct(m.porcentaje);

                            return (
                                <tr key={m.mes}
                                    className={`border-b border-gray-50 dark:border-gray-700/60 transition-colors
                                        ${esMesActual
                                            ? 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-l-purple-500'
                                            : 'hover:bg-gray-50/50 dark:hover:bg-gray-700/20'
                                        }`}>

                                    {/* Mes */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {esMesActual && (
                                                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-purple-500" />
                                            )}
                                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                                {capitalize(m.mes_nombre)}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Presente */}
                                    <td className="px-4 py-3 text-center">
                                        <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                            {m.presente}
                                        </span>
                                    </td>

                                    {/* Ausente */}
                                    <td className="px-4 py-3 text-center">
                                        <span className="text-sm font-bold text-red-600 dark:text-red-400">
                                            {m.ausente}
                                        </span>
                                    </td>

                                    {/* Tardanza */}
                                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                                        <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">
                                            {m.tardanza}
                                        </span>
                                    </td>

                                    {/* Justificado */}
                                    <td className="px-4 py-3 text-center hidden md:table-cell">
                                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                            {m.justificado}
                                        </span>
                                    </td>

                                    {/* Total */}
                                    <td className="px-4 py-3 text-center">
                                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                            {m.total}
                                        </span>
                                    </td>

                                    {/* % con barra */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2 min-w-[80px]">
                                            <span className={`text-sm font-bold whitespace-nowrap ${text}`}>
                                                {m.porcentaje}%
                                            </span>
                                            <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 hidden sm:block">
                                                <div className={`h-1.5 rounded-full ${bar} transition-all duration-500`}
                                                    style={{ width: `${m.porcentaje}%` }} />
                                            </div>
                                        </div>
                                    </td>

                                    {/* Estado badge */}
                                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${badgePct(m.porcentaje)}`}>
                                            {labelPct(m.porcentaje)}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>

                    {/* Pie totales */}
                    {stats && (
                        <tfoot>
                            <tr className="bg-gray-50 dark:bg-gray-700/60 border-t-2 border-gray-200 dark:border-gray-600">
                                <td className="px-4 py-3">
                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                                        Total período
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className="text-sm font-bold text-green-600 dark:text-green-400">{stats.presente}</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className="text-sm font-bold text-red-600 dark:text-red-400">{stats.ausente}</span>
                                </td>
                                <td className="px-4 py-3 text-center hidden sm:table-cell">
                                    <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">{stats.tardanza}</span>
                                </td>
                                <td className="px-4 py-3 text-center hidden md:table-cell">
                                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{stats.justificado}</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{stats.total}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`text-sm font-bold ${colorPct(stats.porcentaje).text}`}>
                                        {stats.porcentaje}%
                                    </span>
                                </td>
                                <td className="px-4 py-3 hidden sm:table-cell" />
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
}
