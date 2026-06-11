import { Users, UserCheck, UserX, Clock, FileCheck } from 'lucide-react';

const STATS = [
    { key: 'total',        label: 'Total registros', icon: Users,      bg: 'bg-gray-50 dark:bg-gray-700/50',    border: 'border-l-gray-400',   icon_color: 'text-gray-500 dark:text-gray-400'   },
    { key: 'presente',     label: 'Presentes',       icon: UserCheck,  bg: 'bg-green-50 dark:bg-green-900/20',  border: 'border-l-green-500',  icon_color: 'text-green-600 dark:text-green-400'  },
    { key: 'ausente',      label: 'Ausentes',        icon: UserX,      bg: 'bg-red-50 dark:bg-red-900/20',      border: 'border-l-red-500',    icon_color: 'text-red-600 dark:text-red-400'      },
    { key: 'tardanza',     label: 'Tardanzas',       icon: Clock,      bg: 'bg-yellow-50 dark:bg-yellow-900/20',border: 'border-l-yellow-500', icon_color: 'text-yellow-600 dark:text-yellow-400'},
    { key: 'justificado',  label: 'Justificados',    icon: FileCheck,  bg: 'bg-blue-50 dark:bg-blue-900/20',    border: 'border-l-blue-500',   icon_color: 'text-blue-600 dark:text-blue-400'    },
];

export default function StatsAsistencia({ stats }) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {STATS.map(({ key, label, icon: Icon, bg, border, icon_color }) => {
                const valor = stats?.[key] ?? 0;
                const total = stats?.total ?? 0;
                const porcentaje = key !== 'total' && total > 0
                    ? Math.round((valor / total) * 100)
                    : null;

                return (
                    <div key={key}
                        className={`${bg} rounded-xl border border-gray-200 dark:border-gray-700 border-l-4 ${border} p-4`}>
                        <div className="flex items-start justify-between mb-2">
                            <div className={`p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm`}>
                                <Icon size={16} className={icon_color} />
                            </div>
                            {porcentaje !== null && (
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                    {porcentaje}%
                                </span>
                            )}
                            {key === 'total' && stats?.porcentaje_asistencia !== undefined && (
                                <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                                    {stats.porcentaje_asistencia}% asist.
                                </span>
                            )}
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{valor}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
                        {porcentaje !== null && (
                            <div className="mt-2 h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all duration-500`}
                                    style={{ width: `${porcentaje}%`, backgroundColor: 'currentColor' }}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
