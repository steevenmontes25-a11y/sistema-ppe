import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from '@inertiajs/react';
import { X, FileText } from 'lucide-react';
import PdfViewerModal from './PdfViewerModal';

// ── Constantes módulo ─────────────────────────────────────────────────────────

const NOTA_COLORS = {
    green:  'text-green-600 dark:text-green-400',
    blue:   'text-blue-600 dark:text-blue-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    red:    'text-red-600 dark:text-red-400',
};

function getNotaKey(nota) {
    const n = parseFloat(nota) || 0;
    if (n >= 9) return 'green';
    if (n >= 7) return 'blue';
    if (n >= 5) return 'yellow';
    return 'red';
}

function formatSize(bytes) {
    if (!bytes) return '';
    if (bytes < 1024)         return `${bytes} B`;
    if (bytes < 1024 * 1024)  return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatFechaCorta(fechaStr) {
    if (!fechaStr) return '—';
    const [y, m, d] = String(fechaStr).slice(0, 10).split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
}

// ── Modal ─────────────────────────────────────────────────────────────────────

export default function CalificarModal({ isOpen, onClose, fila, config, cursoNombre }) {
    const [pdfOpen, setPdfOpen] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        bitacora_id:   '',
        nota:          5,
        justificacion: '',
    });

    useEffect(() => {
        if (isOpen && fila?.entrega) {
            setData({
                bitacora_id:   fila.entrega.id,
                nota:          fila.calificacion ? parseFloat(fila.calificacion.nota) : 5,
                justificacion: fila.calificacion?.justificacion ?? '',
            });
            setPdfOpen(false);
        }
    }, [isOpen, fila?.entrega?.id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('docente.calificaciones.calificar'), {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    if (!isOpen || !fila?.entrega) return null;

    const { entrega, calificacion, estudiante } = fila;
    const colorNota  = NOTA_COLORS[getNotaKey(data.nota)];
    const justLen    = (data.justificacion || '').length;
    const canSave    = data.nota !== '' && justLen >= 10 && !processing;
    const esNoEntrega = entrega.archivo_tipo === 'ninguno' || entrega.archivo_path === 'sin_entrega';

    const modal = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}>

            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <div className="relative z-[10000] w-full max-w-3xl max-h-[90vh] overflow-y-auto
                bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col">

                {/* Header */}
                <div className="flex-shrink-0 bg-gradient-to-r from-purple-700 to-purple-900 px-6 py-4 rounded-t-2xl">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <h2 className="text-white font-bold text-base">
                                Calificar — Bitácora #{config?.numero_global ?? '?'}
                            </h2>
                            <p className="text-purple-200 text-sm truncate mt-0.5">
                                {estudiante.nombre_completo} · {cursoNombre}
                            </p>
                        </div>
                        <button onClick={onClose}
                            className="shrink-0 text-purple-200 hover:text-white transition-colors mt-0.5">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-0 flex-1 min-h-0">

                    {/* ── COLUMNA IZQUIERDA — Archivo ── */}
                    <div className="md:w-[55%] p-5 border-b md:border-b-0 md:border-r
                        border-gray-100 dark:border-gray-700 flex flex-col gap-3">

                        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Archivo entregado
                        </h3>

                        {esNoEntrega ? (
                            <div className="flex flex-col items-center justify-center gap-2 py-8
                                border-2 border-dashed border-gray-200 dark:border-gray-700
                                rounded-xl bg-gray-50 dark:bg-gray-800/50">
                                <FileText size={32} className="text-gray-300 dark:text-gray-600" />
                                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                    Sin archivo — calificado por no entrega
                                </p>
                            </div>
                        ) : (
                            <button type="button" onClick={() => setPdfOpen(true)}
                                className="w-full flex items-center justify-center gap-3 py-8
                                    border-2 border-dashed border-purple-300 dark:border-purple-700
                                    rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20
                                    transition-colors cursor-pointer">
                                <FileText size={32} className="text-purple-400 flex-shrink-0" />
                                <div className="text-left min-w-0">
                                    <p className="font-medium text-gray-700 dark:text-gray-300 truncate">
                                        {entrega.archivo_nombre || 'Archivo adjunto'}
                                    </p>
                                    <p className="text-sm text-purple-600 dark:text-purple-400">
                                        Clic para ver el archivo
                                    </p>
                                </div>
                            </button>
                        )}

                        {/* Metadata */}
                        {!esNoEntrega && (
                            <div className="text-[11px] text-gray-400 dark:text-gray-500 space-y-0.5">
                                {entrega.archivo_nombre && (
                                    <p className="truncate font-medium text-gray-600 dark:text-gray-400">
                                        {entrega.archivo_nombre}
                                        {entrega.archivo_tamanio
                                            ? ` · ${formatSize(entrega.archivo_tamanio)}` : ''}
                                    </p>
                                )}
                                {entrega.fecha_entrega && (
                                    <p>Entregado: {formatFechaCorta(entrega.fecha_entrega)}</p>
                                )}
                            </div>
                        )}

                        {/* Nota del estudiante */}
                        {entrega.descripcion && !esNoEntrega && (
                            <div className="rounded-xl bg-purple-50 dark:bg-purple-900/20
                                border border-purple-100 dark:border-purple-800 px-3 py-2.5">
                                <p className="text-[10px] font-bold text-purple-500 dark:text-purple-400 uppercase tracking-wide mb-1">
                                    Nota del estudiante
                                </p>
                                <p className="text-xs text-gray-700 dark:text-gray-300 italic leading-relaxed">
                                    "{entrega.descripcion}"
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ── COLUMNA DERECHA — Calificación ── */}
                    <div className="md:w-[45%] p-5 flex flex-col gap-4">

                        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Calificación
                        </h3>

                        {calificacion && (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200
                                dark:border-yellow-700 rounded-xl px-3 py-2 text-xs
                                text-yellow-800 dark:text-yellow-200 font-medium">
                                ✏️ Editando calificación existente:{' '}
                                <span className="font-bold">{parseFloat(calificacion.nota).toFixed(1)}/10</span>
                            </div>
                        )}

                        {/* Nota — input + slider */}
                        <div className="flex flex-col gap-2">
                            <div className="text-center py-2">
                                <div className="flex items-end justify-center gap-1">
                                    <input
                                        type="number"
                                        min="0" max="10" step="0.5"
                                        value={data.nota}
                                        onChange={e => setData('nota', parseFloat(e.target.value) || 0)}
                                        className={`text-5xl font-bold text-center w-28
                                            border-b-2 border-purple-500 bg-transparent outline-none
                                            ${colorNota}`}
                                    />
                                    <span className="text-2xl text-gray-400 dark:text-gray-600 mb-1"> / 10</span>
                                </div>
                            </div>

                            <input
                                type="range" min="0" max="10" step="0.5"
                                value={data.nota}
                                onChange={e => setData('nota', parseFloat(e.target.value))}
                                className="w-full accent-purple-600 cursor-pointer"
                            />

                            <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-600 px-0.5">
                                <span>0</span>
                                <span>Insuficiente</span>
                                <span>Regular</span>
                                <span>Bueno</span>
                                <span>10 Exc.</span>
                            </div>

                            {errors.nota && (
                                <p className="text-xs text-red-500">{errors.nota}</p>
                            )}
                        </div>

                        {/* Justificación */}
                        <div className="flex flex-col gap-1.5 flex-1">
                            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                Justificación <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                rows={5}
                                value={data.justificacion}
                                onChange={e => setData('justificacion', e.target.value)}
                                placeholder="Explica el criterio de evaluación: aspectos positivos, puntos a mejorar, observaciones generales..."
                                maxLength={1000}
                                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700
                                    bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200
                                    rounded-xl outline-none resize-none
                                    focus:ring-2 focus:ring-purple-400 focus:border-transparent
                                    placeholder:text-gray-300 dark:placeholder:text-gray-600"
                            />
                            <div className="flex items-center justify-between">
                                <p className={`text-[11px] ${justLen < 10 && justLen > 0
                                    ? 'text-red-500' : 'text-gray-400 dark:text-gray-600'}`}>
                                    {justLen < 10 && justLen > 0
                                        ? `Mínimo 10 caracteres (faltan ${10 - justLen})` : ''}
                                </p>
                                <p className="text-[11px] text-gray-400 dark:text-gray-600 ml-auto">
                                    {justLen}/1000
                                </p>
                            </div>
                            {errors.justificacion && (
                                <p className="text-xs text-red-500">{errors.justificacion}</p>
                            )}
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex-shrink-0 flex items-center justify-end gap-3
                    px-6 py-4 border-t border-gray-100 dark:border-gray-700">
                    <button type="button" onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400
                            border border-gray-200 dark:border-gray-700 rounded-xl
                            hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!canSave}
                        className="flex items-center gap-2 px-5 py-2 text-sm font-semibold
                            bg-purple-600 hover:bg-purple-700
                            disabled:opacity-50 disabled:cursor-not-allowed
                            text-white rounded-xl transition-colors shadow-sm">
                        💾 {processing ? 'Guardando...' : 'Guardar Calificación'}
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {createPortal(modal, document.body)}
            {pdfOpen && !esNoEntrega && (
                <PdfViewerModal
                    url={`/storage/${entrega.archivo_path}`}
                    nombre={entrega.archivo_nombre}
                    tipo={entrega.archivo_tipo}
                    onClose={() => setPdfOpen(false)}
                />
            )}
        </>
    );
}
