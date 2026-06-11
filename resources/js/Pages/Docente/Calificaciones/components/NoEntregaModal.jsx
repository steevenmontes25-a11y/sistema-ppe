import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from '@inertiajs/react';
import { AlertTriangle, X } from 'lucide-react';

const DEFAULT_JUST = 'Nota por no entrega de bitácora en el plazo establecido.';

function formatFechaCorta(fechaStr) {
    if (!fechaStr) return '—';
    const [y, m, d] = String(fechaStr).slice(0, 10).split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
}

export default function NoEntregaModal({ isOpen, onClose, fila, config }) {
    const { data, setData, post, processing } = useForm({
        bitacora_config_id: '',
        estudiante_id:      '',
        justificacion:      DEFAULT_JUST,
    });

    useEffect(() => {
        if (isOpen && fila && config) {
            setData({
                bitacora_config_id: config.id,
                estudiante_id:      fila.estudiante.id,
                justificacion:      DEFAULT_JUST,
            });
        }
    }, [isOpen, fila?.estudiante?.id, config?.id]);

    if (!isOpen || !fila || !config) return null;

    const { estudiante } = fila;
    const actividad = config.actividad;

    const handleSubmit = () => {
        post(route('docente.calificaciones.no-entrega'), {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    const modal = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}>

            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <div className="relative z-[10000] w-full max-w-md bg-white dark:bg-gray-900
                rounded-2xl shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-red-800 px-5 py-4
                    flex items-center gap-3">
                    <AlertTriangle size={22} className="text-white flex-shrink-0" />
                    <h2 className="flex-1 text-white font-bold text-base">
                        Registrar Nota por No Entrega
                    </h2>
                    <button onClick={onClose}
                        className="text-red-200 hover:text-white transition-colors flex-shrink-0">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">

                    {/* Info card */}
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200
                        dark:border-red-800 rounded-xl p-4 space-y-1.5">
                        <p className="text-sm font-semibold text-red-800 dark:text-red-300
                            flex items-center gap-1.5">
                            <AlertTriangle size={14} /> El plazo venció
                        </p>
                        {actividad && (
                            <p className="text-xs text-red-700 dark:text-red-400">
                                <span className="font-medium">Actividad:</span> {actividad.titulo}
                            </p>
                        )}
                        {actividad?.fecha_finalizacion && (
                            <p className="text-xs text-red-700 dark:text-red-400">
                                <span className="font-medium">Venció el:</span>{' '}
                                {formatFechaCorta(actividad.fecha_finalizacion)}
                            </p>
                        )}
                        <p className="text-xs text-red-700 dark:text-red-400">
                            <span className="font-medium">Estudiante:</span>{' '}
                            {estudiante.nombre_completo}
                        </p>
                    </div>

                    {/* Nota fija */}
                    <div className="text-center py-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <span className="text-6xl font-bold text-red-500">2</span>
                        <span className="text-2xl text-gray-400 dark:text-gray-600">/10</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Nota fija por política de no entrega
                        </p>
                    </div>

                    {/* Justificación */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            Justificación
                        </label>
                        <textarea
                            rows={3}
                            value={data.justificacion}
                            onChange={e => setData('justificacion', e.target.value)}
                            maxLength={500}
                            className="w-full px-3 py-2 text-sm border border-gray-200
                                dark:border-gray-700 bg-white dark:bg-gray-800
                                text-gray-800 dark:text-gray-200
                                rounded-xl outline-none resize-none
                                focus:ring-2 focus:ring-red-400 focus:border-transparent"
                        />
                        <p className="text-[11px] text-gray-400 dark:text-gray-500">
                            Puedes personalizar el motivo de la nota
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-5 py-4
                    border-t border-gray-100 dark:border-gray-700">
                    <button type="button" onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400
                            border border-gray-200 dark:border-gray-700 rounded-xl
                            hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={processing}
                        className="flex items-center gap-2 px-5 py-2 text-sm font-semibold
                            bg-red-600 hover:bg-red-700
                            disabled:opacity-50 disabled:cursor-not-allowed
                            text-white rounded-xl transition-colors">
                        <AlertTriangle size={14} />
                        {processing ? 'Guardando...' : 'Confirmar nota 2'}
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
}
