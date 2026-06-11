// Tarjeta de estadística con ícono, número, label y tendencia
export default function StatCard({ icon: Icon, label, value, trend, trendLabel, color = 'primary', loading = false }) {
    const colorMap = {
        primary: {
            bg: 'bg-primary-50',
            iconBg: 'bg-primary-100',
            icon: 'text-primary-600',
            value: 'text-primary-900',
            trend: 'text-primary-600',
        },
        green: {
            bg: 'bg-green-50',
            iconBg: 'bg-green-100',
            icon: 'text-green-600',
            value: 'text-green-900',
            trend: 'text-green-600',
        },
        blue: {
            bg: 'bg-blue-50',
            iconBg: 'bg-blue-100',
            icon: 'text-blue-600',
            value: 'text-blue-900',
            trend: 'text-blue-600',
        },
        orange: {
            bg: 'bg-orange-50',
            iconBg: 'bg-orange-100',
            icon: 'text-orange-600',
            value: 'text-orange-900',
            trend: 'text-orange-600',
        },
        red: {
            bg: 'bg-red-50',
            iconBg: 'bg-red-100',
            icon: 'text-red-600',
            value: 'text-red-900',
            trend: 'text-red-600',
        },
    };

    const c = colorMap[color] || colorMap.primary;

    if (loading) {
        return (
            <div className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
                <div className="flex items-start gap-4">
                    <div className={`${c.iconBg} rounded-xl p-3 w-12 h-12`} />
                    <div className="flex-1">
                        <div className="h-3 bg-gray-200 rounded w-24 mb-3" />
                        <div className="h-8 bg-gray-200 rounded w-16" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow duration-200`}>
            <div className="flex items-start gap-4">
                <div className={`${c.iconBg} rounded-xl p-3 flex-shrink-0`}>
                    <Icon className={c.icon} size={22} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-secondary-500 font-medium truncate">{label}</p>
                    <p className={`text-3xl font-bold mt-0.5 ${c.value}`}>{value}</p>
                    {(trend !== undefined || trendLabel) && (
                        <p className={`text-xs mt-1 ${c.trend}`}>
                            {trend !== undefined && (
                                <span className="font-semibold">{trend > 0 ? '+' : ''}{trend}%</span>
                            )}{' '}
                            {trendLabel}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
