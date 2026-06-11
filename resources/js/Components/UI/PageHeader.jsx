import { Link } from '@inertiajs/react';
import { ChevronRight, Home } from 'lucide-react';

// Encabezado de página con breadcrumb y botón de acción opcional
export default function PageHeader({ title, breadcrumbs = [], action }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
                {breadcrumbs.length > 0 && (
                    <nav className="flex items-center gap-1 text-xs text-secondary-400 mb-1">
                        <Link href="#" className="hover:text-primary-600 flex items-center gap-1">
                            <Home size={12} /> Inicio
                        </Link>
                        {breadcrumbs.map((crumb, i) => (
                            <span key={i} className="flex items-center gap-1">
                                <ChevronRight size={12} />
                                {crumb.href ? (
                                    <Link href={crumb.href} className="hover:text-primary-600">{crumb.label}</Link>
                                ) : (
                                    <span className="text-secondary-600">{crumb.label}</span>
                                )}
                            </span>
                        ))}
                    </nav>
                )}
                <h1 className="text-xl font-bold text-secondary-900">{title}</h1>
            </div>
            {action && (
                <div className="flex-shrink-0">{action}</div>
            )}
        </div>
    );
}
