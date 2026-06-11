import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────

function normFecha(s) { return s ? String(s).slice(0, 10) : ''; }
function formatFecha(s) {
    if (!s) return '—';
    const [y, m, d] = normFecha(s).split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es', {
        day: '2-digit', month: 'long', year: 'numeric',
    });
}
function formatFechaHora(s) {
    if (!s) return '—';
    const d = new Date(s);
    return d.toLocaleDateString('es', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

function colorNota(n) {
    const v = parseFloat(n) || 0;
    if (v >= 9) return 'text-green-600 dark:text-green-400';
    if (v >= 7) return 'text-blue-600 dark:text-blue-400';
    if (v >= 5) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
}
function bgColorNota(n) {
    const v = parseFloat(n) || 0;
    if (v >= 9) return 'bg-green-500';
    if (v >= 7) return 'bg-blue-500';
    if (v >= 5) return 'bg-yellow-500';
    return 'bg-red-500';
}
function headerGrad(n) {
    const v = parseFloat(n) || 0;
    if (v >= 7) return 'from-green-600 to-green-800';
    if (v >= 5) return 'from-yellow-500 to-yellow-700';
    return 'from-red-600 to-red-800';
}
function mensajeNota(n) {
    const v = parseFloat(n) || 0;
    if (v >= 9) return '¡Excelente trabajo! 🌟';
    if (v >= 7) return 'Buen trabajo 👍';
    if (v >= 5) return 'Trabajo regular 📚';
    return 'Necesitas mejorar 💪';
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function DetalleNotaModal({ isOpen, onClose, bitacora }) {
    if (!isOpen || !bitacora?.calificacion) return null;

    const { numero_global, nombre, actividad_titulo, calificacion, fecha_entregada } = bitacora;
    const nota = calificacion.nota;
    const notaNum = parseFloat(nota) || 0;
    const notaPct = Math.min(100, Math.round(notaNum * 10));

    const modal = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}>

            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <div className="relative z-[10000] w-full max-w-lg
                bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className={`shrink-0 bg-gradient-to-r ${headerGrad(nota)} px-6 py-4`}>
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <h2 className="text-white font-bold text-base">
                                Bitácora #{numero_global} — {nombre}
                            </h2>
                            {actividad_titulo && (
                                <p className="text-white/70 text-sm mt-0.5 truncate">{actividad_titulo}</p>
                            )}
                        </div>
                        <button onClick={onClose}
                            className="shrink-0 text-white/70 hover:text-white transition-colors mt-0.5">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">

                    {/* Nota grande */}
                    <div className="text-center py-4">
                        <div className={`text-7xl font-black leading-none ${colorNota(nota)}`}>
                            {parseFloat(nota).toFixed(1)}
                        </div>
                        <div className="text-gray-400 dark:text-gray-500 text-xl mt-1">/10</div>
                        <div className="mt-4 mx-auto w-48 bg-gray-100 dark:bg-gray-700 rounded-full h-3">
                            <div className={`h-3 rounded-full ${bgColorNota(nota)} transition-all duration-700`}
                                style={{ width: `${notaPct}%` }} />
                        </div>
                        <p className={`mt-2.5 text-sm font-semibold ${colorNota(nota)}`}>
                            {mensajeNota(nota)}
                        </p>
                    </div>

                    {/* Info */}
                    <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                        <div className="flex items-center gap-3 px-4 py-3">
                            <span className="text-base shrink-0">📅</span>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                                    Calificado el
                                </p>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {formatFecha(calificacion.fecha_calificacion)}
                                </p>
                            </div>
                        </div>
                        {calificacion.docente && (
                            <div className="flex items-center gap-3 px-4 py-3">
                                <span className="text-base shrink-0">👨‍🏫</span>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                                        Calificado por
                                    </p>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Prof. {calificacion.docente}
                                    </p>
                                </div>
                            </div>
                        )}
                        {fecha_entregada && (
                            <div className="flex items-center gap-3 px-4 py-3">
                                <span className="text-base shrink-0">📤</span>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                                        Tu entrega
                                    </p>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {formatFechaHora(fecha_entregada)}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Justificación */}
                    {calificacion.justificacion && (
                        <div>
                            <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-2">
                                💬 Retroalimentación del docente
                            </p>
                            <p className="italic text-gray-700 dark:text-gray-300
                                bg-purple-50 dark:bg-purple-900/20
                                rounded-xl p-4 leading-relaxed text-sm
                                border border-purple-100 dark:border-purple-800">
                                "{calificacion.justificacion}"
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="shrink-0 px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                    <button onClick={onClose}
                        className="px-5 py-2 text-sm font-medium
                            text-gray-600 dark:text-gray-400
                            border border-gray-200 dark:border-gray-700 rounded-xl
                            hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
}
