import { FolderOpen, CheckCircle, Clock, Star } from 'lucide-react';

const STATS = [
    { key: 'total_entregas', label: 'Total entregas',   icon: FolderOpen,    bg: 'bg-gray-50 dark:bg-gray-700/50',    border: 'border-l-gray-400',    icon_cls: 'text-gray-500 dark:text-gray-400'    },
    { key: 'calificadas',    label: 'Calificadas',      icon: CheckCircle,   bg: 'bg-green-50 dark:bg-green-900/20',  border: 'border-l-green-500',   icon_cls: 'text-green-600 dark:text-green-400'  },
    { key: 'pendientes',     label: 'Pendientes',       icon: Clock,         bg: 'bg-yellow-50 dark:bg-yellow-900/20',border: 'border-l-yellow-500',  icon_cls: 'text-yellow-600 dark:text-yellow-400'},
    { key: 'promedio_notas', label: 'Promedio',         icon: Star,          bg: 'bg-purple-50 dark:bg-purple-900/20',border: 'border-l-purple-500',  icon_cls: 'text-purple-600 dark:text-purple-400'},
];

export default function StatsBitacoras({ stats }) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {STATS.map(({ key, label, icon: Icon, bg, border, icon_cls }) => {
                const valor   = stats?.[key] ?? 0;
                const total   = stats?.total_entregas ?? 0;
                const pct     = key !== 'total_entregas' && key !== 'promedio_notas' && total > 0
                    ? Math.round((valor / total) * 100) : null;
                const display = key === 'promedio_notas'
                    ? `${valor}/10`
                    : valor;

                return (
                    <div key={key}
                        className={`${bg} rounded-xl border border-gray-200 dark:border-gray-700 border-l-4 ${border} p-4`}>
                        <div className="flex items-start justify-between mb-2">
                            <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                                <Icon size={16} className={icon_cls} />
                            </div>
                            {pct !== null && (
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{pct}%</span>
                            )}
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{display}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
                        {pct !== null && (
                            <div className="mt-2 h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                <div className="h-full bg-current rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
