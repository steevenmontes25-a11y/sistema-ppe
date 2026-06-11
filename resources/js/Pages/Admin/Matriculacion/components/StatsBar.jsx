import { Users, UserCheck, BookOpen } from 'lucide-react';

const CURSO_COLORS = [
    'bg-blue-500',
    'bg-green-500',
    'bg-orange-500',
    'bg-purple-500',
];

function StatCard({ icon: Icon, label, value, colorClass, borderColor }) {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4 shadow-sm border-l-4 ${borderColor}`}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorClass} flex-shrink-0`}>
                <Icon size={20} className="text-white" />
            </div>
            <div className="min-w-0">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">{value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{label}</p>
            </div>
        </div>
    );
}

export default function StatsBar({ stats }) {
    const porCurso = stats?.por_curso || [];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
                icon={Users}
                label="Total matriculados"
                value={stats?.total ?? 0}
                colorClass="bg-purple-500"
                borderColor="border-l-purple-500"
            />
            <StatCard
                icon={UserCheck}
                label="Estudiantes activos"
                value={stats?.activos ?? 0}
                colorClass="bg-green-500"
                borderColor="border-l-green-500"
            />
            {porCurso.slice(0, 2).map((curso, i) => (
                <StatCard
                    key={curso.id}
                    icon={BookOpen}
                    label={curso.nombre}
                    value={curso.count}
                    colorClass={CURSO_COLORS[i + 2] || 'bg-indigo-500'}
                    borderColor={`border-l-${['blue', 'orange', 'teal', 'pink'][i]}-500`}
                />
            ))}
        </div>
    );
}
