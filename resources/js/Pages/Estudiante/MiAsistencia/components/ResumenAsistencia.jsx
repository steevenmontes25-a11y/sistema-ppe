// ── Helpers ───────────────────────────────────────────────────────────────────

function strokeColor(pct) {
    if (pct >= 90) return '#4ADE80';
    if (pct >= 75) return 'white';
    if (pct >= 60) return '#FCD34D';
    return '#F87171';
}

function alerta(pct) {
    if (pct >= 90) return {
        cls: 'bg-green-500/20 border-green-400/40 text-green-100',
        msg: '🌟 ¡Excelente asistencia! Sigue así.',
    };
    if (pct >= 75) return {
        cls: 'bg-blue-500/20 border-blue-400/40 text-blue-100',
        msg: '👍 Buena asistencia. Mantén el ritmo.',
    };
    if (pct >= 60) return {
        cls: 'bg-yellow-500/20 border-yellow-400/40 text-yellow-100',
        msg: '⚠️ Tu asistencia está en riesgo. Necesitas mejorar para no reprobar.',
    };
    return {
        cls: 'bg-red-500/20 border-red-400/40 text-red-100',
        msg: '🚨 Asistencia crítica. Riesgo de reprobar. Habla con tu coordinador.',
    };
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function ResumenAsistencia({ stats }) {
    if (!stats) return null;

    const { presente, ausente, tardanza, justificado, total, porcentaje } = stats;

    const radio          = 60;
    const circunferencia = 2 * Math.PI * radio;
    const offset         = circunferencia - (porcentaje / 100) * circunferencia;
    const color          = strokeColor(porcentaje);
    const info           = alerta(porcentaje);

    const tarjetas = [
        { icon: '✅', label: 'Presentes',     value: presente },
        { icon: '❌', label: 'Ausencias',     value: ausente },
        { icon: '⏰', label: 'Tardanzas',     value: tardanza },
        { icon: '📝', label: 'Justificados',  value: justificado },
    ];

    return (
        <div className="bg-gradient-to-br from-purple-700 to-purple-900 rounded-2xl p-6 mb-6 text-white shadow-lg">
            <p className="text-sm font-bold uppercase tracking-widest text-purple-200 mb-5 text-center">
                Asistencia del Período
            </p>

            {/* Círculo */}
            <div className="flex flex-col items-center mb-5">
                <svg width="160" height="160" className="mx-auto">
                    <circle cx="80" cy="80" r={radio}
                        fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="12" />
                    <circle cx="80" cy="80" r={radio}
                        fill="none" stroke={color} strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={circunferencia}
                        strokeDashoffset={offset}
                        transform="rotate(-90 80 80)"
                        style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.5s ease' }}
                    />
                    <text x="80" y="76" textAnchor="middle"
                        fill="white" fontSize="28" fontWeight="bold">
                        {total > 0 ? `${porcentaje}%` : '—'}
                    </text>
                    <text x="80" y="98" textAnchor="middle"
                        fill="rgba(255,255,255,0.65)" fontSize="12">
                        {total > 0 ? 'asistencia' : 'Sin registros'}
                    </text>
                </svg>

                {/* Alerta */}
                {total > 0 && (
                    <div className={`mt-2 w-full max-w-sm border rounded-xl px-4 py-2.5 text-sm font-medium text-center ${info.cls}`}>
                        {info.msg}
                    </div>
                )}
            </div>

            {/* Tarjetas stats */}
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

            {/* Total */}
            <p className="text-center text-xs text-purple-300 mt-4">
                {total} registros en total en este período
            </p>
        </div>
    );
}
