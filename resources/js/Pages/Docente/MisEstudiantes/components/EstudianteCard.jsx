import { Eye } from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────

const COLORS = [
    'bg-purple-500', 'bg-blue-500', 'bg-green-500',
    'bg-pink-500',   'bg-indigo-500', 'bg-yellow-500',
];

function getColor(name) {
    return COLORS[(name?.charCodeAt(0) ?? 0) % COLORS.length];
}

function getInitials(name) {
    return (name || '').split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase() || '?';
}

function barAsistencia(pct) {
    if (pct >= 90) return 'bg-green-500';
    if (pct >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
}

// ── ProgressBar ───────────────────────────────────────────────────────────────

function ProgressBar({ value, max, colorCls }) {
    const pct = max > 0 ? Math.min(100, Math.round(value / max * 100)) : 0;
    return (
        <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${colorCls}`} style={{ width: `${pct}%` }} />
        </div>
    );
}

// ── EstudianteCard ────────────────────────────────────────────────────────────

export default function EstudianteCard({ estudiante, onVerDetalle }) {
    const { asistencia, bitacoras } = estudiante;
    const pctBit = bitacoras.total > 0
        ? Math.round(bitacoras.entregadas / bitacoras.total * 100) : 0;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg dark:hover:shadow-gray-900/50 transition-shadow flex flex-col overflow-hidden">

            {/* Avatar + nombre */}
            <div className="flex flex-col items-center pt-5 pb-4 px-4 gap-2">
                <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                    {estudiante.foto
                        ? <img src={estudiante.foto_url} alt={estudiante.nombre_completo}
                            className="w-full h-full object-cover" />
                        : <div className={`w-full h-full flex items-center justify-center ${getColor(estudiante.nombre_completo)}`}>
                            <span className="text-white font-bold text-lg select-none">
                                {getInitials(estudiante.nombre_completo)}
                            </span>
                          </div>
                    }
                </div>
                <div className="text-center">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 leading-tight">
                        {estudiante.nombre_completo}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {estudiante.numero_matricula}
                        {estudiante.curso && (
                            <span> · {estudiante.curso.nombre}</span>
                        )}
                    </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold
                    ${estudiante.estado === 'activo'
                        ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}>
                    {estudiante.estado === 'activo' ? 'Activo' : 'Inactivo'}
                </span>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 dark:border-gray-700" />

            {/* Asistencia */}
            <div className="px-4 py-3 space-y-1.5">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Asistencia
                    </span>
                    <span className={`text-xs font-bold
                        ${asistencia.porcentaje >= 90 ? 'text-green-600 dark:text-green-400'
                          : asistencia.porcentaje >= 70 ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-red-600 dark:text-red-400'}`}>
                        {asistencia.porcentaje}%
                    </span>
                </div>
                <ProgressBar value={asistencia.presentes} max={asistencia.total}
                    colorCls={barAsistencia(asistencia.porcentaje)} />
                <div className="flex gap-3 text-[10px] text-gray-500 dark:text-gray-400">
                    <span>✅ {asistencia.presentes}</span>
                    <span>❌ {asistencia.ausentes}</span>
                    <span>⏰ {asistencia.tardanzas}</span>
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 dark:border-gray-700" />

            {/* Bitácoras */}
            <div className="px-4 py-3 space-y-1.5">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Bitácoras
                    </span>
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                        {bitacoras.entregadas}/{bitacoras.total}
                    </span>
                </div>
                <ProgressBar value={bitacoras.entregadas} max={bitacoras.total}
                    colorCls="bg-purple-500" />
                {bitacoras.promedio !== null && (
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                        Promedio: <span className="font-semibold text-gray-700 dark:text-gray-300">
                            {bitacoras.promedio}/10
                        </span>
                    </p>
                )}
            </div>

            {/* Acción */}
            <div className="p-3 mt-auto border-t border-gray-100 dark:border-gray-700">
                <button onClick={() => onVerDetalle(estudiante)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold
                        text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20
                        border border-purple-200 dark:border-purple-800/50
                        rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors">
                    <Eye size={13} /> Ver detalle
                </button>
            </div>
        </div>
    );
}
