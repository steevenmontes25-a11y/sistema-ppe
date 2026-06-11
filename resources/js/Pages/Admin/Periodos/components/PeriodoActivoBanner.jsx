import { CheckCircle, Calendar, Users, BookOpen, FileText, GraduationCap } from 'lucide-react';

export default function PeriodoActivoBanner({ periodo }) {
    if (!periodo) return null;

    const fmt = (d) => new Date(d + 'T00:00:00').toLocaleDateString('es-EC', {
        day: '2-digit', month: 'short', year: 'numeric',
    });

    const pct = periodo.progreso ?? 0;

    return (
        <div className="rounded-2xl overflow-hidden shadow-lg mb-6">
            <div className="bg-gradient-to-r from-purple-700 to-purple-900 px-6 py-5">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">

                    {/* Ícono + título */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2.5 bg-white/15 rounded-xl flex-shrink-0">
                            <CheckCircle size={20} className="text-white" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-xs font-semibold text-green-300 uppercase tracking-wider">
                                    🟢 Período Activo
                                </span>
                            </div>
                            <h2 className="text-white font-bold text-xl truncate">{periodo.nombre}</h2>
                            <div className="flex items-center gap-1.5 text-purple-200 text-xs mt-0.5">
                                <Calendar size={11} />
                                <span>
                                    {fmt(periodo.fecha_inicio)} → {fmt(periodo.fecha_fin)}
                                </span>
                                <span className="opacity-50">·</span>
                                <span>{periodo.duracion_dias} días</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats rápidas */}
                    <div className="flex items-center gap-5 flex-shrink-0">
                        {[
                            { icon: Users,     val: periodo.stats?.estudiantes ?? 0, label: 'est.' },
                            { icon: GraduationCap, val: periodo.stats?.docentes ?? 0, label: 'doc.' },
                            { icon: BookOpen,  val: periodo.stats?.actividades ?? 0, label: 'act.' },
                            { icon: FileText,  val: periodo.stats?.bitacoras ?? 0,  label: 'bit.' },
                        ].map(({ icon: Icon, val, label }) => (
                            <div key={label} className="text-center">
                                <Icon size={14} className="text-purple-300 mx-auto mb-0.5" />
                                <p className="text-white font-bold text-lg leading-none">{val}</p>
                                <p className="text-purple-300 text-xs">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Barra de progreso */}
                <div className="mt-4">
                    <div className="flex justify-between text-xs text-purple-200 mb-1.5">
                        <span>Progreso del período</span>
                        <span className="font-semibold">{pct}% completado</span>
                    </div>
                    <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white rounded-full transition-all duration-700"
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
