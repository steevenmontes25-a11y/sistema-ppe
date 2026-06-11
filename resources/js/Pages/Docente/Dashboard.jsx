import { Head, usePage } from '@inertiajs/react';
import DocenteLayout from '@/Layouts/DocenteLayout';
import {
    Users, BookOpen, Award, TrendingUp,
    Clock, AlertTriangle, CheckCircle, CalendarCheck,
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

function saludo() {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
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

// ── Componente principal ──────────────────────────────────────────────────────

export default function Dashboard({
    cursosAsignados, bitacorasPendientes, actividadesProximas,
    asistenciaHoy, stats, periodoActivo,
}) {
    const { auth } = usePage().props;
    const nombre = auth.user?.nombres?.split(' ')[0] ?? auth.user?.name?.split(' ')[0] ?? 'Docente';

    const pctAsistencia = asistenciaHoy.total > 0
        ? Math.round(asistenciaHoy.presente / asistenciaHoy.total * 100) : 0;

    return (
        <DocenteLayout title="Dashboard">
            <Head title="Dashboard" />

            {/* Greeting */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 mb-6 text-white shadow-lg">
                <p className="text-sm font-medium text-indigo-200">{saludo()},</p>
                <h1 className="text-xl font-bold mt-0.5">Dr(a). {nombre}</h1>
                {periodoActivo && (
                    <p className="text-xs text-indigo-200 mt-1">{periodoActivo.nombre}</p>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard icon={Users}      label="Total estudiantes"    value={stats.total_estudiantes}    color="purple" />
                <StatCard icon={BookOpen}   label="Por calificar"        value={stats.bitacoras_pendientes} color="orange" />
                <StatCard icon={Award}      label="Calificaciones dadas" value={stats.calificaciones_dadas} color="blue"   />
                <StatCard icon={TrendingUp} label="Promedio general"     value={stats.promedio_general ?? '—'} sub={stats.promedio_general ? '/10' : 'Sin datos'} color="green" />
            </div>

            {/* Cursos */}
            {cursosAsignados.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Mis cursos</h2>
                    <div className="flex flex-wrap gap-3">
                        {cursosAsignados.map(c => (
                            <div key={c.id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-3 shadow-sm flex items-center gap-3">
                                <div className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 p-2 rounded-lg">
                                    <BookOpen size={16} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{c.nombre}</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">{c.total_estudiantes} estudiante{c.total_estudiantes !== 1 ? 's' : ''}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Layout dos columnas */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                {/* ── COLUMNA IZQUIERDA (3/5) ── */}
                <div className="lg:col-span-3 flex flex-col gap-5">

                    {/* Bitácoras por calificar */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle size={16} className="text-orange-500 shrink-0" />
                            <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
                                Bitácoras por calificar
                            </h3>
                            {bitacorasPendientes.length > 0 && (
                                <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                                    {bitacorasPendientes.length}
                                </span>
                            )}
                        </div>
                        {bitacorasPendientes.length === 0 ? (
                            <div className="text-center py-6">
                                <CheckCircle size={24} className="text-green-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-400 dark:text-gray-500">
                                    ¡Todo al día! No hay bitácoras por calificar
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {bitacorasPendientes.map((b, i) => (
                                    <div key={b.id ?? i} className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/10 rounded-xl">
                                        <div className="shrink-0 w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                                            <span className="text-xs font-bold text-orange-700 dark:text-orange-300">
                                                {(b.estudiante || '?')[0]?.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">
                                                {b.estudiante}
                                            </p>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                                                Bitácora #{b.numero_global}{b.nombre_bitacora ? ` — ${b.nombre_bitacora}` : ''}
                                                {b.curso ? ` · ${b.curso}` : ''} · {b.hace}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Próximas actividades */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Clock size={16} className="text-purple-500 shrink-0" />
                            <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
                                Próximas actividades
                            </h3>
                        </div>
                        {actividadesProximas.length === 0 ? (
                            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
                                No hay actividades próximas a vencer
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {actividadesProximas.map((a, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-xl transition-colors">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">{a.titulo}</p>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                                {a.curso} · {formatFecha(a.fecha_entrega)}
                                                {a.tipo_entrega && ` · ${a.tipo_entrega}`}
                                            </p>
                                        </div>
                                        {diasBadge(a.dias_restantes)}
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
                        <div className="flex items-center gap-2 mb-4">
                            <CalendarCheck size={16} className="text-green-500 shrink-0" />
                            <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
                                Asistencia de hoy
                            </h3>
                        </div>

                        {asistenciaHoy.registrado ? (
                            <>
                                <div className="flex justify-center mb-3">
                                    <svg width="90" height="90">
                                        <circle cx="45" cy="45" r="36" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                                        <circle cx="45" cy="45" r="36" fill="none"
                                            stroke={pctAsistencia >= 80 ? '#16a34a' : pctAsistencia >= 60 ? '#2563eb' : '#dc2626'}
                                            strokeWidth="8" strokeLinecap="round"
                                            strokeDasharray={2 * Math.PI * 36}
                                            strokeDashoffset={2 * Math.PI * 36 * (1 - pctAsistencia / 100)}
                                            transform="rotate(-90 45 45)"
                                            style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
                                        <text x="45" y="49" textAnchor="middle"
                                            fill={pctAsistencia >= 80 ? '#16a34a' : '#2563eb'}
                                            fontSize="14" fontWeight="bold">{pctAsistencia}%</text>
                                    </svg>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { label: 'Presentes',    v: asistenciaHoy.presente,    cls: 'text-green-600 dark:text-green-400',  bg: 'bg-green-50 dark:bg-green-900/20'   },
                                        { label: 'Ausentes',     v: asistenciaHoy.ausente,     cls: 'text-red-600 dark:text-red-400',     bg: 'bg-red-50 dark:bg-red-900/20'       },
                                        { label: 'Tardanzas',    v: asistenciaHoy.tardanza,    cls: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20'},
                                        { label: 'Justificados', v: asistenciaHoy.justificado, cls: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-50 dark:bg-blue-900/20'     },
                                    ].map(t => (
                                        <div key={t.label} className={`${t.bg} rounded-xl p-2.5 text-center`}>
                                            <p className={`text-base font-bold ${t.cls}`}>{t.v}</p>
                                            <p className="text-[10px] text-gray-400 dark:text-gray-500">{t.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-2">
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4">
                                    <AlertTriangle size={20} className="text-yellow-500 mx-auto mb-2" />
                                    <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                                        Asistencia no registrada
                                    </p>
                                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                                        Aún no has registrado asistencia hoy
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DocenteLayout>
    );
}
