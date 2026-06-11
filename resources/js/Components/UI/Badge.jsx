// Etiqueta de estado con colores semánticos
const variants = {
    presente:    'bg-green-100 text-green-700 ring-green-600/20',
    ausente:     'bg-red-100 text-red-700 ring-red-600/20',
    tardanza:    'bg-yellow-100 text-yellow-700 ring-yellow-600/20',
    justificado: 'bg-blue-100 text-blue-700 ring-blue-600/20',
    pendiente:   'bg-orange-100 text-orange-700 ring-orange-600/20',
    revisado:    'bg-green-100 text-green-700 ring-green-600/20',
    activo:      'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
    inactivo:    'bg-gray-100 text-gray-600 ring-gray-500/20',
    admin:       'bg-primary-100 text-primary-700 ring-primary-600/20',
    docente:     'bg-blue-100 text-blue-700 ring-blue-600/20',
    estudiante:  'bg-purple-100 text-purple-700 ring-purple-600/20',
    default:     'bg-gray-100 text-gray-600 ring-gray-500/20',
};

const labels = {
    presente:    'Presente',
    ausente:     'Ausente',
    tardanza:    'Tardanza',
    justificado: 'Justificado',
    pendiente:   'Pendiente',
    revisado:    'Revisado',
    activo:      'Activo',
    inactivo:    'Inactivo',
    admin:       'Coordinador',
    docente:     'Docente',
    estudiante:  'Estudiante',
};

export default function Badge({ variant = 'default', label, className = '' }) {
    const style = variants[variant] || variants.default;
    const text  = label ?? labels[variant] ?? variant;

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${style} ${className}`}>
            {text}
        </span>
    );
}
