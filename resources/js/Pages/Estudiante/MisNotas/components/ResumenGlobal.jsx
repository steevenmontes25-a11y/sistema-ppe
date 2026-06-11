// ── Helpers ───────────────────────────────────────────────────────────────────

function strokeColor(promedio) {
    if (promedio === null) return 'rgba(255,255,255,0.4)';
    if (promedio >= 9) return '#4ADE80';
    if (promedio >= 7) return 'white';
    if (promedio >= 5) return '#FCD34D';
    return '#F87171';
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function ResumenGlobal({ stats }) {
    if (!stats) return null;

    const {
        promedio_global, mejor_nota, total_calificadas,
        total_bitacoras, aprobadas, reprobadas, porcentaje_avance,
    } = stats;

    const radio          = 60;
    const circunferencia = 2 * Math.PI * radio;
    const pct            = promedio_global !== null ? promedio_global / 10 : 0;
    const offset         = circunferencia - pct * circunferencia;
    const color          = strokeColor(promedio_global);

    const tarjetas = [
        { icon: '📊', label: 'Calificadas', value: `${total_calificadas}/${total_bitacoras}` },
        { icon: '✅', label: 'Aprobadas',   value: aprobadas },
        { icon: '❌', label: 'Reprobadas',  value: reprobadas },
        { icon: '📈', label: 'Mejor nota',  value: mejor_nota !== null ? parseFloat(mejor_nota).toFixed(1) : '—' },
    ];

    return (
        <div className="bg-gradient-to-br from-purple-700 to-purple-900 rounded-2xl p-6 mb-6 text-white shadow-lg">

            {/* Título */}
            <p className="text-sm font-bold uppercase tracking-widest text-purple-200 mb-5 text-center">
                Promedio General
            </p>

            {/* Círculo SVG */}
            <div className="flex flex-col items-center mb-6">
                <svg width="160" height="160" className="mx-auto">
                    {/* Fondo */}
                    <circle cx="80" cy="80" r={radio}
                        fill="none" stroke="rgba(255,255,255,0.15)"
                        strokeWidth="12" />
                    {/* Progreso */}
                    <circle cx="80" cy="80" r={radio}
                        fill="none" stroke={color} strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={circunferencia}
                        strokeDashoffset={offset}
                        transform="rotate(-90 80 80)"
                        style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.5s ease' }}
                    />
                    {/* Nota */}
                    <text x="80" y="76" textAnchor="middle"
                        fill="white" fontSize="28" fontWeight="bold">
                        {promedio_global !== null ? parseFloat(promedio_global).toFixed(1) : '—'}
                    </text>
                    <text x="80" y="98" textAnchor="middle"
                        fill="rgba(255,255,255,0.65)" fontSize="13">
                        {promedio_global !== null ? 'de 10' : 'Sin notas aún'}
                    </text>
                </svg>

                {/* Barra de avance */}
                {promedio_global !== null && (
                    <div className="w-48 mt-2">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] text-purple-200">Avance</span>
                            <span className="text-[11px] text-purple-200 font-bold">{porcentaje_avance}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-white/20">
                            <div className="h-2 rounded-full bg-white/80 transition-all duration-1000"
                                style={{ width: `${porcentaje_avance}%` }} />
                        </div>
                    </div>
                )}
            </div>

            {/* Tarjetas de stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {tarjetas.map(t => (
                    <div key={t.label}
                        className="bg-white/10 hover:bg-white/15 transition-colors rounded-xl px-3 py-3 text-center">
                        <p className="text-lg mb-0.5">{t.icon}</p>
                        <p className="text-xl font-bold text-white leading-none">{t.value}</p>
                        <p className="text-[11px] text-purple-200 mt-1">{t.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
