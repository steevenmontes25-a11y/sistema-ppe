import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { X, Loader2 } from 'lucide-react';

const ESTADOS = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'activa',    label: 'Activa' },
    { value: 'cerrada',   label: 'Cerrada' },
];

// Constantes fuera del componente
const inputCls = 'w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100';
const labelCls = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

export default function BitacoraConfigModal({ isOpen, bitacora, actividades, onClose }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        nombre:       '',
        actividad_id: '',
        estado:       'pendiente',
        descripcion:  '',
    });

    // Popula el formulario cuando cambia la bitácora o se abre el modal
    useEffect(() => {
        if (!isOpen) return;
        if (bitacora) {
            setData({
                nombre:       bitacora.nombre        ?? '',
                actividad_id: bitacora.actividad_id ? String(bitacora.actividad_id) : '',
                estado:       bitacora.estado         ?? 'pendiente',
                descripcion:  bitacora.descripcion    ?? '',
            });
        } else {
            reset();
        }
    }, [isOpen, bitacora]);

    // Cerrar con ESC
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    if (!isOpen || !bitacora) return null;

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.cronograma.bitacora-config.update', bitacora.id), {
            onSuccess: () => onClose(),
            preserveScroll: true,
        });
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop — z-index mayor que ActividadModal para superponerse si ambos están montados */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Card */}
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-lg">

                {/* Encabezado */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <div>
                        <h2 className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                            Editar Bitácora {bitacora.numero}
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Configura el nombre, actividad vinculada y estado
                        </p>
                    </div>
                    <button onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 dark:text-gray-400">
                        <X size={18} />
                    </button>
                </div>

                {/* Formulario */}
                <form onSubmit={submit} className="p-6 space-y-4">

                    {/* Nombre */}
                    <div>
                        <label className={labelCls}>Nombre <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={data.nombre}
                            onChange={e => setData('nombre', e.target.value)}
                            placeholder="Ej: Bitácora 1"
                            className={inputCls}
                        />
                        {errors.nombre && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.nombre}</p>}
                    </div>

                    {/* Actividad vinculada */}
                    <div>
                        <label className={labelCls}>Actividad vinculada</label>
                        <select
                            value={data.actividad_id}
                            onChange={e => setData('actividad_id', e.target.value)}
                            className={inputCls}
                        >
                            <option value="">Sin vincular</option>
                            {(actividades || []).map(act => (
                                <option key={act.id} value={String(act.id)}>{act.titulo}</option>
                            ))}
                        </select>
                        {errors.actividad_id && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.actividad_id}</p>}
                    </div>

                    {/* Estado */}
                    <div>
                        <label className={labelCls}>Estado <span className="text-red-500">*</span></label>
                        <select
                            value={data.estado}
                            onChange={e => setData('estado', e.target.value)}
                            className={inputCls}
                        >
                            {ESTADOS.map(({ value, label }) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                        {errors.estado && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.estado}</p>}
                    </div>

                    {/* Descripción */}
                    <div>
                        <label className={labelCls}>Descripción</label>
                        <textarea
                            rows={3}
                            value={data.descripcion}
                            onChange={e => setData('descripcion', e.target.value)}
                            placeholder="Descripción opcional..."
                            className={`${inputCls} resize-none`}
                        />
                        {errors.descripcion && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.descripcion}</p>}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                        <button type="button" onClick={onClose} disabled={processing}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={processing}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors disabled:opacity-60">
                            {processing && <Loader2 size={14} className="animate-spin" />}
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
