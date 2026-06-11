import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { createPortal } from 'react-dom';
import { X, Edit3, Loader2 } from 'lucide-react';

const ESTADO_CONFIG = {
    presente:    { label: 'Presente',    emoji: '✅', bg: 'bg-green-100 dark:bg-green-900/30',  text: 'text-green-700 dark:text-green-400',  border: 'border-green-400'  },
    ausente:     { label: 'Ausente',     emoji: '❌', bg: 'bg-red-100 dark:bg-red-900/30',      text: 'text-red-700 dark:text-red-400',      border: 'border-red-400'    },
    tardanza:    { label: 'Tardanza',    emoji: '⏰', bg: 'bg-yellow-100 dark:bg-yellow-900/30',text: 'text-yellow-700 dark:text-yellow-400',border: 'border-yellow-400' },
    justificado: { label: 'Justificado', emoji: '📝', bg: 'bg-blue-100 dark:bg-blue-900/30',    text: 'text-blue-700 dark:text-blue-400',    border: 'border-blue-400'   },
};

const formatFecha = (d) => {
    if (!d) return '';
    const str = typeof d === 'string' ? d : String(d);
    const fecha = new Date(str.includes('T') ? str : str + 'T00:00:00');
    return fecha.toLocaleDateString('es-EC', {
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    });
};

export default function CorreccionModal({ isOpen, asistencia, onClose }) {
    const { data, setData, put, processing, errors } = useForm({
        estado: '',
        observacion: '',
    });

    useEffect(() => {
        if (!isOpen || !asistencia) return;
        setData({
            estado:      asistencia.estado      ?? '',
            observacion: asistencia.observacion ?? '',
        });
    }, [isOpen, asistencia?.id]);

    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    if (!isOpen || !asistencia) return null;

    const nombreDocente = asistencia.registrado_por?.nombres
        ? `${asistencia.registrado_por.nombres} ${asistencia.registrado_por.apellidos}`
        : (asistencia.registrado_por?.name ?? '—');

    const nombreEstudiante = asistencia.estudiante?.nombres
        ? `${asistencia.estudiante.nombres} ${asistencia.estudiante.apellidos}`
        : (asistencia.estudiante?.name ?? '—');

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.asistencia.update', asistencia.id), {
            onSuccess: () => onClose(),
            preserveScroll: true,
        });
    };

    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />

            <div
                className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                style={{ zIndex: 10000 }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-700 to-purple-900 px-5 py-4 flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-xl flex-shrink-0">
                        <Edit3 size={18} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-white font-bold text-base">Corregir Asistencia</h2>
                        <p className="text-purple-200 text-xs truncate">
                            {nombreEstudiante} — {formatFecha(asistencia.fecha)}
                        </p>
                    </div>
                    <button onClick={onClose}
                        className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={submit} className="p-5 space-y-4">

                    {/* Info original */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-sm space-y-1">
                        <p className="text-gray-500 dark:text-gray-400 text-xs">
                            Registrado por:{' '}
                            <span className="font-medium text-gray-700 dark:text-gray-200">{nombreDocente}</span>
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Estado original:</span>
                            {asistencia.estado && ESTADO_CONFIG[asistencia.estado] && (
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                                    ${ESTADO_CONFIG[asistencia.estado].bg} ${ESTADO_CONFIG[asistencia.estado].text}`}>
                                    {ESTADO_CONFIG[asistencia.estado].emoji} {ESTADO_CONFIG[asistencia.estado].label}
                                </span>
                            )}
                        </div>
                        {asistencia.corregido_por && (
                            <p className="text-xs text-purple-600 dark:text-purple-400">
                                ✏️ Ya corregido por:{' '}
                                {asistencia.corregido_por?.nombres
                                    ? `${asistencia.corregido_por.nombres} ${asistencia.corregido_por.apellidos}`
                                    : asistencia.corregido_por?.name}
                            </p>
                        )}
                    </div>

                    {/* Selector de estado */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nuevo estado <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {Object.entries(ESTADO_CONFIG).map(([key, cfg]) => (
                                <button key={key} type="button"
                                    onClick={() => setData('estado', key)}
                                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all
                                        ${data.estado === key
                                            ? `${cfg.border} ${cfg.bg}`
                                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}`}>
                                    <span className="text-xl">{cfg.emoji}</span>
                                    <span className={`text-xs font-medium leading-tight text-center
                                        ${data.estado === key ? cfg.text : 'text-gray-600 dark:text-gray-400'}`}>
                                        {cfg.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                        {errors.estado && <p className="text-xs text-red-500 mt-1">{errors.estado}</p>}
                    </div>

                    {/* Observación */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Observación
                        </label>
                        <textarea rows={3} value={data.observacion}
                            onChange={e => setData('observacion', e.target.value)}
                            placeholder="Motivo de la corrección (opcional)..."
                            className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none" />
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-1">
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={processing || !data.estado}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors disabled:opacity-60">
                            {processing && <Loader2 size={14} className="animate-spin" />}
                            Aplicar corrección
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
