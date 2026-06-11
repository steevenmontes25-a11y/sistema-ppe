import { createPortal } from 'react-dom';
import { X, Download, FileText, Image, AlertCircle } from 'lucide-react';

// ── Constantes de módulo ──────────────────────────────────────────────────────

const ESTADO_CONFIG = {
    entregada: { label: 'Entregada', bg: 'bg-blue-100 dark:bg-blue-900/30',   text: 'text-blue-700 dark:text-blue-400'   },
    revisada:  { label: 'Revisada',  bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
    devuelta:  { label: 'Devuelta',  bg: 'bg-yellow-100 dark:bg-yellow-900/30',text: 'text-yellow-700 dark:text-yellow-400'},
};

const NOTA_CONFIG = (n) => {
    if (n >= 9) return { color: 'text-green-600 dark:text-green-400', bar: 'bg-green-500' };
    if (n >= 7) return { color: 'text-blue-600 dark:text-blue-400',   bar: 'bg-blue-500'  };
    if (n >= 5) return { color: 'text-yellow-600 dark:text-yellow-400',bar: 'bg-yellow-500'};
    return       { color: 'text-red-600 dark:text-red-400',            bar: 'bg-red-500'   };
};

const formatBytes = (b) => {
    if (!b) return '';
    if (b < 1024)          return `${b} B`;
    if (b < 1024 * 1024)   return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
};

const formatFecha = (d) => {
    if (!d) return '—';
    const str  = typeof d === 'string' ? d : String(d);
    const fecha = new Date(str.includes('T') ? str : str + 'T00:00:00');
    return fecha.toLocaleDateString('es-EC', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

function DataRow({ label, value }) {
    return (
        <div className="flex items-start gap-2 py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
            <span className="text-xs text-gray-400 dark:text-gray-500 w-28 flex-shrink-0 pt-0.5">{label}</span>
            <span className="text-xs font-medium text-gray-900 dark:text-gray-100 flex-1">{value || '—'}</span>
        </div>
    );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function BitacoraDetalleModal({ isOpen, bitacora, onClose }) {
    if (!isOpen || !bitacora) return null;

    const nombreEst  = bitacora.estudiante?.nombres
        ? `${bitacora.estudiante.nombres} ${bitacora.estudiante.apellidos}`
        : (bitacora.estudiante?.name ?? '—');

    const estadoCfg  = ESTADO_CONFIG[bitacora.estado] ?? {};
    const esPdf      = bitacora.archivo_tipo === 'pdf';
    const esImagen   = ['imagen', 'foto', 'jpg', 'jpeg', 'png', 'webp'].includes(bitacora.archivo_tipo);
    const archivoUrl = bitacora.archivo_path ? `/storage/${bitacora.archivo_path}` : null;
    const nota       = bitacora.calificacion ? parseFloat(bitacora.calificacion.nota) : null;
    const notaCfg    = nota !== null ? NOTA_CONFIG(nota) : null;
    const descargaUrl= route('admin.bitacoras.descargar', bitacora.id);

    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />

            <div
                className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden"
                style={{ zIndex: 10000 }}
                onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="bg-gradient-to-r from-purple-700 to-purple-900 px-5 py-4 flex items-center gap-3 flex-shrink-0">
                    <div className="p-2 bg-white/10 rounded-xl flex-shrink-0">
                        <FileText size={18} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-white font-bold text-base">
                            Bitácora {bitacora.config?.numero_global ?? '—'} — {bitacora.config?.nombre ?? ''}
                        </h2>
                        <p className="text-purple-200 text-xs truncate">
                            {nombreEst} · {bitacora.curso?.nombre ?? '—'}
                        </p>
                    </div>
                    <button onClick={onClose}
                        className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0">
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto">
                    <div className="flex flex-col md:flex-row h-full">

                        {/* ── Col izquierda: Archivo (60%) ── */}
                        <div className="md:w-3/5 p-5 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700 space-y-4">

                            {/* Vista previa */}
                            <div>
                                {esPdf && archivoUrl ? (
                                    <div>
                                        <iframe
                                            src={archivoUrl}
                                            title="Vista previa PDF"
                                            className="w-full rounded-lg border border-gray-200 dark:border-gray-700"
                                            style={{ height: '380px' }}
                                            sandbox="allow-scripts allow-same-origin"
                                        />
                                        <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-1">
                                            Si no carga, usa el botón descargar
                                        </p>
                                    </div>
                                ) : esImagen && archivoUrl ? (
                                    <img
                                        src={archivoUrl}
                                        alt="Bitácora"
                                        className="w-full rounded-lg object-contain max-h-96 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-48 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                                        <FileText size={32} className="text-gray-300 dark:text-gray-600 mb-2" />
                                        <p className="text-sm text-gray-400 dark:text-gray-500">Vista previa no disponible</p>
                                        <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">
                                            Tipo: {bitacora.archivo_tipo ?? 'desconocido'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Metadata archivo */}
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-xs space-y-1">
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                    {esPdf ? <FileText size={13} className="flex-shrink-0" />
                                           : <Image size={13} className="flex-shrink-0" />}
                                    <span className="font-medium text-gray-800 dark:text-gray-200 truncate">
                                        {bitacora.archivo_nombre}
                                    </span>
                                </div>
                                {bitacora.archivo_tamanio && (
                                    <p className="text-gray-500 dark:text-gray-400 pl-5">
                                        {formatBytes(bitacora.archivo_tamanio)} · Subido el {formatFecha(bitacora.fecha_entrega)}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* ── Col derecha: Info (40%) ── */}
                        <div className="md:w-2/5 p-5 space-y-4">

                            {/* Datos de entrega */}
                            <div>
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                    📋 Datos de entrega
                                </p>
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                                    <DataRow label="Estudiante"   value={`${nombreEst} (${bitacora.estudiante?.numero_matricula ?? ''})`} />
                                    <DataRow label="Bitácora N°"  value={bitacora.config?.numero_global} />
                                    <DataRow label="Fase"         value={bitacora.config?.fase?.nombre} />
                                    <DataRow label="Fecha entrega"value={formatFecha(bitacora.fecha_entrega)} />
                                    <div className="flex items-center gap-2 py-1.5">
                                        <span className="text-xs text-gray-400 dark:text-gray-500 w-28 flex-shrink-0">Estado</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoCfg.bg} ${estadoCfg.text}`}>
                                            {estadoCfg.label ?? bitacora.estado}
                                        </span>
                                    </div>
                                    {bitacora.descripcion && (
                                        <div className="pt-2 mt-1 border-t border-gray-100 dark:border-gray-600">
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Nota del estudiante:</p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                                                "{bitacora.descripcion}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Calificación */}
                            <div>
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                    ⭐ Calificación del docente
                                </p>

                                {nota !== null ? (
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-3">
                                        {/* Nota grande */}
                                        <div className="text-center">
                                            <p className={`text-4xl font-bold ${notaCfg.color}`}>
                                                {parseFloat(nota).toFixed(2)}
                                                <span className="text-lg font-normal text-gray-400 dark:text-gray-500">/10</span>
                                            </p>
                                            <div className="mt-2 h-2.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full transition-all ${notaCfg.bar}`}
                                                    style={{ width: `${(nota / 10) * 100}%` }} />
                                            </div>
                                        </div>

                                        <div className="space-y-1 text-xs">
                                            <p className="text-gray-500 dark:text-gray-400">
                                                Docente:{' '}
                                                <span className="font-medium text-gray-700 dark:text-gray-200">
                                                    {bitacora.calificacion.docente?.nombres
                                                        ? `${bitacora.calificacion.docente.nombres} ${bitacora.calificacion.docente.apellidos}`
                                                        : (bitacora.calificacion.docente?.name ?? '—')}
                                                </span>
                                            </p>
                                            <p className="text-gray-500 dark:text-gray-400">
                                                Fecha:{' '}
                                                <span className="font-medium text-gray-700 dark:text-gray-200">
                                                    {formatFecha(bitacora.calificacion.fecha_calificacion)}
                                                </span>
                                            </p>
                                        </div>

                                        {bitacora.calificacion.justificacion && (
                                            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Justificación:</p>
                                                <p className="text-xs text-purple-800 dark:text-purple-200 italic leading-relaxed">
                                                    "{bitacora.calificacion.justificacion}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                                        <AlertCircle size={18} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                                                Pendiente de calificación
                                            </p>
                                            <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-0.5">
                                                Esta bitácora aún no ha sido revisada por el docente.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end items-center gap-3 px-5 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
                    <button onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        Cerrar
                    </button>
                    <a href={descargaUrl}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors">
                        <Download size={14} />
                        Descargar archivo
                    </a>
                </div>
            </div>
        </div>,
        document.body
    );
}
