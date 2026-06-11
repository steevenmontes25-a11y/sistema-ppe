import { Head, usePage, Link } from '@inertiajs/react';
import EstudianteLayout from '@/Layouts/EstudianteLayout';
import {
    BookOpen, Award, CalendarCheck, TrendingUp,
    Clock, CheckCircle, AlertTriangle, Upload,
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatFecha(s) {
    if (!s) return '—';
    const [y, m, d] = String(s).slice(0, 10).split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es', { day: '2-digit', month: 'short' });
}

function diasBadge(dias) {
    if (dias === null || dias === undefined) return null;
    if (dias === 0) return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">¡Hoy!</span>;
    if (dias <= 3)  return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700">{dias} días</span>;
    return                 <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">{dias} días</span>;
}

function notaColor(nota) {
    if (nota == null) return 'text-gray-400';
    if (nota >= 9)    return 'text-green-600 dark:text-green-400';
    if (nota >= 7)    return 'text-blue-600 dark:text-blue-400';
    if (nota >= 5)    return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, color = 'purple' }) {
    const colors = {
        purple: { border: 'border-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', icon: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300' },
        blue:   { border: 'border-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20',     icon: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300'     },
        green:  { border: 'border-green-500',  bg: 'bg-green-50 dark:bg-green-900/20',   icon: 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300'  },
        orange: { border: 'border-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', icon: 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-300' },
    };
    const c = colors[color];
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl border-l-4 ${c.border} ${c.bg} border border-gray-100 dark:border-gray-700 p-4 shadow-sm flex items-center gap-4`}>
            <div className={`shrink-0 p-2.5 rounded-xl ${c.icon}`}>
                <Icon size={20} />
            </div>
            <div className="min-w-0">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-none">{value ?? '—'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
                {sub && <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

// ── Asistencia mini circle ────────────────────────────────────────────────────

function AsistenciaMes({ asistencia }) {
    const pct = asistencia.porcentaje_mes ?? 0;
    const r   = 44;
    const c   = 2 * Math.PI * r;
    const off = c - (pct / 100) * c;
    const color = pct >= 90 ? '#16a34a' : pct >= 75 ? '#2563eb' : pct >= 60 ? '#d97706' : '#dc2626';

    const alertBg = pct >= 90 ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300'
        : pct >= 75 ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300'
        : pct >= 60 ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300'
        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300';

    const alertMsg = pct >= 90 ? '¡Excelente asistencia! Sigue así.'
        : pct >= 75 ? 'Buena asistencia. Mantén el ritmo.'
        : pct >= 60 ? 'Asistencia regular. Procura mejorar.'
        : 'Asistencia baja. Riesgo de reprobación.';

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <CalendarCheck size={16} className="text-green-500 shrink-0" />
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">Asistencia del mes</h3>
                <Link href={route('estudiante.asistencia.index')} className="ml-auto text-[11px] text-purple-500 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
                    Ver todo →
                </Link>
            </div>

            {asistencia.total_mes > 0 ? (
                <>
                    <div className="flex justify-center mb-3">
                        <svg width="110" height="110">
                            <circle cx="55" cy="55" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" />
                            <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="10"
                                strokeLinecap="round"
                                strokeDasharray={c} strokeDashoffset={off}
                                transform="rotate(-90 55 55)"
                                style={{ transition: 'stroke-dashoffset 1s ease' }} />
                            <text x="55" y="58" textAnchor="middle" fill={color} fontSize="16" fontWeight="bold">{pct}%</text>
                        </svg>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                        {[
                            { label: 'Presentes', v: asistencia.presente, cls: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
                            { label: 'Ausentes',  v: asistencia.ausente,  cls: 'text-red-600 dark:text-red-400',   bg: 'bg-red-50 dark:bg-red-900/20'     },
                            { label: 'Tardanzas', v: asistencia.tardanza, cls: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
                        ].map(t => (
                            <div key={t.label} className={`${t.bg} rounded-xl p-2 text-center`}>
                                <p className={`text-sm font-bold ${t.cls}`}>{t.v}</p>
                                <p className="text-[10px] text-gray-400 dark:text-gray-500">{t.label}</p>
                            </div>
                        ))}
                    </div>
                    <div className={`border rounded-xl p-2.5 text-xs text-center font-medium ${alertBg}`}>
                        {alertMsg}
                    </div>
                </>
            ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
                    No hay registros de asistencia este mes
                </p>
            )}
        </div>
    );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function Dashboard({
    proximasBitacoras, ultimasNotas, asistencia, stats, curso, sinMatricula, periodoActivo,
}) {
    const { auth } = usePage().props;
    const nombre = auth.user?.nombres?.split(' ')[0] ?? auth.user?.name?.split(' ')[0] ?? 'Estudiante';

    if (sinMatricula) {
        return (
            <EstudianteLayout title="Dashboard">
                <Head title="Dashboard" />
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-2xl p-8 max-w-md">
                        <AlertTriangle size={32} className="text-yellow-500 mx-auto mb-3" />
                        <h2 className="text-lg font-bold text-yellow-800 dark:text-yellow-200 mb-1">No tienes matrícula activa</h2>
                        <p className="text-sm text-yellow-600 dark:text-yellow-400">
                            {periodoActivo
                                ? `No estás matriculado en el período "${periodoActivo.nombre}". Consulta con tu administrador.`
                                : 'No hay un período lectivo activo. Consulta con tu administrador.'}
                        </p>
                    </div>
                </div>
            </EstudianteLayout>
        );
    }

    const pctEntrega = stats.total_bitacoras > 0
        ? Math.round(stats.bitacoras_entregadas / stats.total_bitacoras * 100) : 0;

    const proximaUrgente = proximasBitacoras?.[0];

    return (
        <EstudianteLayout title="Dashboard">
            <Head title="Dashboard" />

            {/* Greeting card */}
            <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 rounded-2xl p-5 mb-6 text-white shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                        <p className="text-sm font-medium text-purple-200">¡Hola de nuevo,</p>
                        <h1 className="text-xl font-bold mt-0.5">{nombre}!</h1>
                        {curso && <p className="text-xs text-purple-200 mt-1">{curso.nombre}</p>}
                        {periodoActivo && <p className="text-xs text-purple-300 mt-0.5">{periodoActivo.nombre}</p>}
                    </div>

                    {/* Próxima bitácora urgente */}
                    {proximaUrgente && (
                        <div className="bg-white/15 backdrop-blur rounded-xl p-3 text-xs shrink-0 max-w-[200px]">
                            <p className="font-bold text-white text-[11px] mb-0.5">Próxima entrega</p>
                            <p className="text-purple-100 truncate">Bitácora #{proximaUrgente.numero_global}</p>
                            {proximaUrgente.actividad && (
                                <p className="text-purple-200 truncate">{proximaUrgente.actividad}</p>
                            )}
                            <div className="mt-1 flex items-center justify-between">
                                <span className="text-purple-200">{formatFecha(proximaUrgente.fecha_entrega)}</span>
                                {diasBadge(proximaUrgente.dias_restantes)}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard icon={TrendingUp}  label="Promedio notas"     value={stats.promedio_notas ?? '—'}      sub={stats.promedio_notas ? '/10' : 'Sin notas aún'}      color="purple" />
                <StatCard icon={BookOpen}    label="Bitácoras entregadas" value={`${stats.bitacoras_entregadas}/${stats.total_bitacoras}`} sub={`${pctEntrega}% completado`} color="blue"   />
                <StatCard icon={CalendarCheck} label="Asistencia del mes" value={`${asistencia.porcentaje_mes}%`}   sub={`${asistencia.presente} de ${asistencia.total_mes} días`} color="green" />
                <StatCard icon={Award}       label="Progreso del período" value={`${pctEntrega}%`}              sub="bitácoras entregadas"                                color="orange" />
            </div>

            {/* Layout dos columnas */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                {/* ── COLUMNA IZQUIERDA (3/5) ── */}
                <div className="lg:col-span-3 flex flex-col gap-5">

                    {/* Próximas entregas */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Upload size={16} className="text-purple-500 shrink-0" />
                            <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
                                Próximas entregas
                            </h3>
                            <Link href={route('estudiante.cronograma.index')} className="ml-auto text-[11px] text-purple-500 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
                                Ver cronograma →
                            </Link>
                        </div>
                        {proximasBitacoras.length === 0 ? (
                            <div className="text-center py-6">
                                <CheckCircle size={24} className="text-green-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-400 dark:text-gray-500">
                                    ¡Todo al día! No tienes entregas pendientes
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {proximasBitacoras.map((b, i) => (
                                    <div key={i} className={`flex items-center gap-3 p-3 rounded-xl
                                        ${b.dias_restantes === 0 ? 'bg-red-50 dark:bg-red-900/10'
                                        : b.dias_restantes <= 3 ? 'bg-yellow-50 dark:bg-yellow-900/10'
                                        : 'bg-purple-50 dark:bg-purple-900/10'}`}>
                                        <div className="shrink-0 w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-xs font-bold text-purple-700 dark:text-purple-300">
                                            #{b.numero_global}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">
                                                {b.nombre ?? b.actividad ?? `Bitácora #${b.numero_global}`}
                                            </p>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                                Entrega: {formatFecha(b.fecha_entrega)}
                                                {b.tipo_entrega && ` · ${b.tipo_entrega}`}
                                            </p>
                                        </div>
                                        {diasBadge(b.dias_restantes)}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Asistencia mes */}
                    <AsistenciaMes asistencia={asistencia} />
                </div>

                {/* ── COLUMNA DERECHA (2/5) ── */}
                <div className="lg:col-span-2 flex flex-col gap-5">

                    {/* Últimas notas */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Award size={16} className="text-purple-500 shrink-0" />
                            <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
                                Últimas notas
                            </h3>
                            <Link href={route('estudiante.notas.index')} className="ml-auto text-[11px] text-purple-500 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
                                Ver todas →
                            </Link>
                        </div>

                        {ultimasNotas.length === 0 ? (
                            <div className="text-center py-6">
                                <Clock size={24} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                                <p className="text-sm text-gray-400 dark:text-gray-500">
                                    Aún no tienes calificaciones registradas
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {ultimasNotas.map((n, i) => (
                                    <div key={i} className="flex items-center gap-3 p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-xl transition-colors">
                                        <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm
                                            ${n.nota >= 7 ? 'bg-green-100 dark:bg-green-900/30' : n.nota >= 5 ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                                            <span className={notaColor(n.nota)}>{n.nota}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">
                                                {n.nombre_bitacora ?? `Bitácora #${n.numero_global}`}
                                            </p>
                                            <p className="text-[11px] text-gray-400 dark:text-gray-500">
                                                {formatFecha(n.fecha)}
                                            </p>
                                        </div>
                                        {/* Mini nota bar */}
                                        <div className="w-12 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden shrink-0">
                                            <div className={`h-full rounded-full transition-all duration-700
                                                ${n.nota >= 7 ? 'bg-green-500' : n.nota >= 5 ? 'bg-yellow-400' : 'bg-red-400'}`}
                                                style={{ width: `${(n.nota / 10) * 100}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Promedio resumen */}
                        {stats.promedio_notas && (
                            <div className={`mt-4 p-3 rounded-xl border text-center
                                ${stats.promedio_notas >= 7 ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                                : stats.promedio_notas >= 5 ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
                                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'}`}>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400">Promedio global</p>
                                <p className={`text-2xl font-bold ${notaColor(stats.promedio_notas)}`}>
                                    {stats.promedio_notas}
                                    <span className="text-xs font-normal text-gray-400 dark:text-gray-500 ml-1">/10</span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </EstudianteLayout>
    );
}
