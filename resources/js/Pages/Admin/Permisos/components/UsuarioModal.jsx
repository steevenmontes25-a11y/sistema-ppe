import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from '@inertiajs/react';
import { X, Shield, Info, UserPlus } from 'lucide-react';

const inputCls = `w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600
    bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100
    rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition`;

const labelCls = 'block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide';

export default function UsuarioModal({ isOpen, onClose }) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        nombres:   '',
        apellidos: '',
        email:     '',
        cedula:    '',
        rol:       'docente',
    });

    useEffect(() => {
        if (isOpen) {
            reset();
            clearErrors();
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.permisos.store'), {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden"
                style={{ zIndex: 10000 }}
                onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="bg-gradient-to-r from-purple-700 to-purple-900 px-5 py-4 flex items-center gap-3 flex-shrink-0">
                    <div className="p-2 bg-white/15 rounded-xl">
                        <Shield size={18} className="text-white" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-white font-bold text-base">Crear Usuario</h2>
                        <p className="text-purple-200 text-xs">Nuevo acceso al sistema</p>
                    </div>
                    <button onClick={onClose}
                        className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="p-5 space-y-4">

                        {/* Nombres | Apellidos */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelCls}>Nombres <span className="text-red-500">*</span></label>
                                <input type="text" value={data.nombres}
                                    onChange={e => setData('nombres', e.target.value)}
                                    placeholder="María Elena"
                                    className={inputCls + (errors.nombres ? ' border-red-400' : '')} />
                                {errors.nombres && <p className="text-red-500 text-xs mt-1">{errors.nombres}</p>}
                            </div>
                            <div>
                                <label className={labelCls}>Apellidos <span className="text-red-500">*</span></label>
                                <input type="text" value={data.apellidos}
                                    onChange={e => setData('apellidos', e.target.value)}
                                    placeholder="García López"
                                    className={inputCls + (errors.apellidos ? ' border-red-400' : '')} />
                                {errors.apellidos && <p className="text-red-500 text-xs mt-1">{errors.apellidos}</p>}
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className={labelCls}>Email <span className="text-red-500">*</span></label>
                            <input type="email" value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                placeholder="usuario@institucion.edu"
                                className={inputCls + (errors.email ? ' border-red-400' : '')} />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        {/* Cédula | Rol */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelCls}>Cédula <span className="text-red-500">*</span></label>
                                <input type="text" value={data.cedula}
                                    onChange={e => setData('cedula', e.target.value)}
                                    placeholder="1700000000"
                                    maxLength={20}
                                    className={inputCls + (errors.cedula ? ' border-red-400' : '')} />
                                {errors.cedula && <p className="text-red-500 text-xs mt-1">{errors.cedula}</p>}
                            </div>
                            <div>
                                <label className={labelCls}>Rol <span className="text-red-500">*</span></label>
                                <select value={data.rol}
                                    onChange={e => setData('rol', e.target.value)}
                                    className={inputCls + (errors.rol ? ' border-red-400' : '')}>
                                    <option value="docente">Docente</option>
                                    <option value="admin">Coordinador (Admin)</option>
                                </select>
                                {errors.rol && <p className="text-red-500 text-xs mt-1">{errors.rol}</p>}
                            </div>
                        </div>

                        {/* Info contraseña */}
                        <div className="flex items-start gap-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3">
                            <Info size={15} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                                    Contraseña inicial: cédula
                                </p>
                                <p className="text-xs text-blue-600 dark:text-blue-300 mt-0.5">
                                    El usuario deberá cambiarla en su primer acceso. Se puede resetear desde la tabla de permisos.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={processing}
                            className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl transition-colors">
                            <UserPlus size={14} />
                            {processing ? 'Creando...' : 'Crear Usuario'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
