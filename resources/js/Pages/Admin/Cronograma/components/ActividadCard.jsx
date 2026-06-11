import { Calendar, Clock, CheckCircle, FileText, Image, Type, Layers, Edit2 } from 'lucide-react';

const TIPO_ICONS  = { pdf: FileText, foto: Image, texto: Type, mixto: Layers };
const TIPO_COLORS = {
    pdf:   'bg-blue-100 text-blue-700',
    foto:  'bg-green-100 text-green-700',
    texto: 'bg-gray-100 text-gray-700',
    mixto: 'bg-purple-100 text-purple-700',
};
const ESTADO_COLORS = {
    borrador: 'bg-gray-100 text-gray-600',
    activa:   'bg-green-100 text-green-700',
    cerrada:  'bg-red-100 text-red-600',
};

const fmt = (fecha) => {
    if (!fecha) return '—';
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-EC', {
        day: '2-digit', month: 'long', year: 'numeric',
    });
};

export default function ActividadCard({ actividad, totalEstudiantes = 0, onEditar }) {
    const TipoIcon = TIPO_ICONS[actividad.tipo_entrega] || FileText;
    const entregadas = actividad.bitacoras_count ?? 0;
    const progreso   = totalEstudiantes > 0 ? Math.round((entregadas / totalEstudiantes) * 100) : 0;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            {/* Encabezado */}
            <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-bold text-secondary-900 text-base leading-tight">{actividad.titulo}</h3>
                <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 capitalize ${ESTADO_COLORS[actividad.estado] || ''}`}>
                    {actividad.estado}
                </span>
            </div>

            {actividad.descripcion && (
                <p className="text-sm text-secondary-500 mb-4 line-clamp-2">{actividad.descripcion}</p>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
                {actividad.fase_ppe && (
                    <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-100 text-purple-700">
                        {actividad.fase_ppe.nombre}
                    </span>
                )}
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${TIPO_COLORS[actividad.tipo_entrega] || ''}`}>
                    <TipoIcon size={11} />
                    {actividad.tipo_entrega?.toUpperCase()}
                </span>
            </div>

            {/* Fechas */}
            <div className="space-y-1.5 text-sm mb-4">
                <div className="flex items-center gap-2 text-secondary-600">
                    <Calendar size={14} className="text-secondary-400 shrink-0" />
                    <span>Inicio: <span className="font-medium">{fmt(actividad.fecha_inicio)}</span></span>
                </div>
                <div className="flex items-center gap-2 text-secondary-600">
                    <Clock size={14} className="text-secondary-400 shrink-0" />
                    <span>Entrega: <span className="font-medium">{fmt(actividad.fecha_entrega)}</span></span>
                </div>
                <div className="flex items-center gap-2 text-secondary-600">
                    <CheckCircle size={14} className="text-secondary-400 shrink-0" />
                    <span>Cierre: <span className="font-medium">{fmt(actividad.fecha_finalizacion)}</span></span>
                </div>
            </div>

            {/* Barra de progreso de entregas */}
            {totalEstudiantes > 0 && (
                <div className="mb-4">
                    <div className="flex justify-between text-xs text-secondary-500 mb-1">
                        <span>Entregas</span>
                        <span className="font-medium">{entregadas} / {totalEstudiantes}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-600 rounded-full transition-all" style={{ width: `${progreso}%` }} />
                    </div>
                </div>
            )}

            <button
                onClick={() => onEditar(actividad)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-primary-700 border border-primary-200 rounded-xl hover:bg-primary-50 transition-colors"
            >
                <Edit2 size={14} /> Editar actividad
            </button>
        </div>
    );
}
