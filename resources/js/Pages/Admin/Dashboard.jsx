import { Head, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Users, GraduationCap, Calendar, BookOpen,
    Clock, TrendingUp, AlertTriangle, CheckCircle,
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────

function normFecha(s) { return s ? String(s).slice(0, 10) : ''; }
function formatFecha(s) {
    if (!s) return '—';
    const [y, m, d] = normFecha(s).split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es', { day: '2-digit', month: 'short' });
}
function fechaHoy() {
    return new Date().toLocaleDateString('es', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
}
function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

function diasBadge(dias) {
    if (dias === null || dias === undefined) return null;
    if (dias === 0) return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">¡Hoy!</span>;
    if (dias <= 3)  return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700">{dias} días</span>;
    return                 <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">{dias} días</span>;
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, color = 'purple' }) {
    const colors = {
        purple: 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300',
        blue:   'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
        green:  'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300',
        orange: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300',
    };
    const iconBg = {
        purple: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300',
        blue:   'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300',
        green:  'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300',
        orange: 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-300',
    };
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl border-l-4 ${colors[color]} border border-gray-100 dark:border-gray-700 p-4 shadow-sm flex items-center gap-4`}>
            <div className={`shrink-0 p-2.5 rounded-xl ${iconBg[color]}`}>
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

// ── Asistencia Circle ─────────────────────────────────────────────────────────

function AsistenciaCircle({ pct }) {
    const r   = 40;
    const c   = 2 * Math.PI * r;
    const off = c - (pct / 100) * c;
    const color = pct >= 90 ? '#16a34a' : pct >= 75 ? '#2563eb' : pct >= 60 ? '#d97706' : '#dc2626';
    return (
        <svg width="100" height="100" className="mx-auto">
            <circle cx="50" cy="50" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" />
            <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={c} strokeDashoffset={off}
                transform="rotate(-90 50 50)"
                style={{ transition: 'stroke-dashoffset 1s ease' }} />
            <text x="50" y="53" textAnchor="middle" fill={color} fontSize="16" fontWeight="bold">{pct}%</text>
        </svg>
    );
}

// ── Barra horizontal ──────────────────────────────────────────────────────────

function BarraH({ label, valor, max, color = 'bg-purple-500' }) {
    const pct = max > 0 ? Math.round((valor / max) * 100) : 0;
    return (
        <div className="flex items-center gap-3">
            <p className="text-xs text-gray-600 dark:text-gray-400 w-28 shrink-0 truncate" title={label}>{label}</p>
            <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                <div className={`h-2 rounded-full ${color} transition-all duration-700`}
                    style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 w-6 text-right shrink-0">{valor}</span>
        </div>
    );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function Dashboard({
    stats, resumenAsistenciaHoy, actividadesProximas,
    bitacorasRecientes, entregasPorCurso, estudiantesPorCurso, periodoActivo,
}) {
    const { auth } = usePage().props;
    const pctAsistencia = resumenAsistenciaHoy.total > 0
        ? Math.round(resumenAsistenciaHoy.presente / resumenAsistenciaHoy.total * 100) : 0;

    const maxEst  = Math.max(...(estudiantesPorCurso?.map(c => c.total) ?? [0]), 1);
    const maxEnt  = Math.max(...(entregasPorCurso?.map(c => c.total_entregas) ?? [0]), 1);

    return (
        <AdminLayout title="Dashboard">
            <Head title="Dashboard" />

            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Bienvenido, {auth.user?.nombres ?? auth.user?.name}
                        {periodoActivo && ` · ${periodoActivo.nombre}`}
                    </p>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">{capitalize(fechaHoy())}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard icon={GraduationCap} label="Estudiantes activos"     value={stats.estudiantes}          color="purple" />
                <StatCard icon={Users}         label="Docentes activos"        value={stats.docentes}             color="blue"   />
                <StatCard icon={Calendar}      label="Actividades del período" value={stats.actividades}          color="green"  />
                <StatCard icon={BookOpen}      label="Bitácoras por calificar" value={stats.bitacoras_pendientes} color="orange" />
            </div>

            {/* Layout dos columnas */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                {/* ── COLUMNA IZQUIERDA (3/5) ── */}
                <div className="lg:col-span-3 flex flex-col gap-5">

                    {/* Actividades próximas */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle size={16} className="text-orange-500 shrink-0" />
                            <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
                                ⚡ Próximas entregas — 7 días
                            </h3>
                        </div>
                        {actividadesProximas.length === 0 ? (
                            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
                                No hay actividades próximas a vencer
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {actividadesProximas.map((a, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">
                                                {a.titulo}
                                            </p>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                                {a.curso} · Vence: {formatFecha(a.fecha_entrega)}
                                            </p>
                                        </div>
                                        {diasBadge(a.dias_restantes)}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Entregas recientes */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp size={16} className="text-purple-500 shrink-0" />
                            <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
                                Entregas recientes (últimas 24 h)
                            </h3>
                            {bitacorasRecientes.length > 0 && (
                                <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                                    {bitacorasRecientes.length}
                                </span>
                            )}
                        </div>
                        {bitacorasRecientes.length === 0 ? (
                            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
                                No hay entregas en las últimas 24 horas
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {bitacorasRecientes.map(b => (
                                    <div key={b.id} className="flex items-center gap-3 p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-xl transition-colors">
                                        <div className="shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                                            <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                                                {(b.estudiante || '?')[0]?.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">
                                                {b.estudiante} entregó Bitácora #{b.numero_global}
                                            </p>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                                                {b.curso} · {b.hace}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── COLUMNA DERECHA (2/5) ── */}
                <div className="lg:col-span-2 flex flex-col gap-5">

                    {/* Asistencia hoy */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <Clock size={16} className="text-green-500 shrink-0" />
                            <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
                                Asistencia de hoy
                            </h3>
                        </div>
                        {resumenAsistenciaHoy.total > 0 ? (
                            <>
                                <AsistenciaCircle pct={pctAsistencia} />
                                <div className="grid grid-cols-3 gap-2 mt-3">
                                    {[
                                        { label: 'Presentes', v: resumenAsistenciaHoy.presente, cls: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
                                        { label: 'Ausentes',  v: resumenAsistenciaHoy.ausente,  cls: 'text-red-600 dark:text-red-400',   bg: 'bg-red-50 dark:bg-red-900/20'   },
                                        { label: 'Tardanzas', v: resumenAsistenciaHoy.tardanza,  cls: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
                                    ].map(t => (
                                        <div key={t.label} className={`${t.bg} rounded-xl p-2 text-center`}>
                                            <p className={`text-base font-bold ${t.cls}`}>{t.v}</p>
                                            <p className="text-[10px] text-gray-400 dark:text-gray-500">{t.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-sm text-gray-400 dark:text-gray-500">
                                    📋 Aún no se ha registrado asistencia hoy
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Estudiantes por curso */}
                    {estudiantesPorCurso?.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
                            <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm mb-3">
                                Estudiantes por curso
                            </h3>
                            <div className="space-y-2.5">
                                {estudiantesPorCurso.map(c => (
                                    <BarraH key={c.id} label={c.nombre} valor={c.total} max={maxEst} color="bg-purple-500" />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Estado bitácoras por curso */}
                    {entregasPorCurso?.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
                            <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm mb-3">
                                Estado bitácoras por curso
                            </h3>
                            <div className="space-y-3">
                                {entregasPorCurso.map(c => (
                                    <div key={c.id}>
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[120px]" title={c.nombre}>{c.nombre}</p>
                                            <span className="text-[10px] text-gray-400 dark:text-gray-500 shrink-0 ml-1">
                                                {c.calificadas}/{c.total_entregas}
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div className="h-2 bg-purple-300 dark:bg-purple-700 rounded-full"
                                                style={{ width: `${maxEnt > 0 ? (c.total_entregas / maxEnt) * 100 : 0}%` }} />
                                        </div>
                                        <div className="w-full h-1.5 bg-transparent mt-0.5">
                                            <div className="h-1.5 bg-green-500 rounded-full"
                                                style={{ width: `${maxEnt > 0 ? (c.calificadas / maxEnt) * 100 : 0}%` }} />
                                        </div>
                                    </div>
                                ))}
                                <div className="flex gap-3 text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-300" />Entregadas</span>
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" />Calificadas</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
