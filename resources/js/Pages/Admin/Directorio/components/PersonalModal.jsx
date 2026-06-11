import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from '@inertiajs/react';
import { X, Users, Camera, Save } from 'lucide-react';

const inputCls = `w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600
    bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100
    rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition`;

const labelCls = 'block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide';

export default function PersonalModal({ isOpen, personal, onClose }) {
    const esEdicion = personal !== null;
    const fileRef   = useRef(null);
    const [preview, setPreview] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        nombre:       '',
        cargo:        '',
        departamento: '',
        email:        '',
        telefono:     '',
        tipo:         'docente',
        activo:       true,
        foto:         null,
    });

    useEffect(() => {
        if (isOpen) {
            if (personal) {
                setData({
                    nombre:       personal.nombre       ?? '',
                    cargo:        personal.cargo        ?? '',
                    departamento: personal.departamento ?? '',
                    email:        personal.email        ?? '',
                    telefono:     personal.telefono     ?? '',
                    tipo:         personal.tipo         ?? 'docente',
                    activo:       personal.activo       ?? true,
                    foto:         null,
                });
                setPreview(personal.foto_url ?? null);
            } else {
                reset();
                setPreview(null);
            }
            clearErrors();
        }
    }, [isOpen, personal?.id]);

    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setData('foto', file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const opts = { forceFormData: true, preserveScroll: true, onSuccess: () => onClose() };
        if (esEdicion) {
            put(route('admin.directorio.update', personal.id), opts);
        } else {
            post(route('admin.directorio.store'), opts);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden"
                style={{ zIndex: 10000 }}
                onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="bg-gradient-to-r from-purple-700 to-purple-900 px-5 py-4 flex items-center gap-3 flex-shrink-0">
                    <div className="p-2 bg-white/15 rounded-xl">
                        <Users size={18} className="text-white" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-white font-bold text-base">
                            {esEdicion ? 'Editar Personal' : 'Agregar al Directorio'}
                        </h2>
                        <p className="text-purple-200 text-xs">
                            {esEdicion ? `Modificando: ${personal.nombre}` : 'Nuevo miembro del directorio'}
                        </p>
                    </div>
                    <button onClick={onClose}
                        className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="p-5 space-y-5">

                        {/* Foto */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-purple-200 dark:border-purple-800 bg-gray-100 dark:bg-gray-700">
                                    {preview ? (
                                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Users size={32} className="text-gray-300 dark:text-gray-600" />
                                        </div>
                                    )}
                                </div>
                                <button type="button" onClick={() => fileRef.current?.click()}
                                    className="absolute bottom-0 right-0 p-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors shadow-lg">
                                    <Camera size={12} />
                                </button>
                            </div>
                            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFotoChange} />
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                JPG, PNG · máx. 2 MB
                            </p>
                            {errors.foto && <p className="text-red-500 text-xs">{errors.foto}</p>}
                        </div>

                        {/* Nombre | Cargo */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelCls}>Nombre <span className="text-red-500">*</span></label>
                                <input type="text" value={data.nombre}
                                    onChange={e => setData('nombre', e.target.value)}
                                    placeholder="Prof. María García"
                                    className={inputCls + (errors.nombre ? ' border-red-400' : '')} />
                                {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
                            </div>
                            <div>
                                <label className={labelCls}>Cargo <span className="text-red-500">*</span></label>
                                <input type="text" value={data.cargo}
                                    onChange={e => setData('cargo', e.target.value)}
                                    placeholder="Docente PPE"
                                    className={inputCls + (errors.cargo ? ' border-red-400' : '')} />
                                {errors.cargo && <p className="text-red-500 text-xs mt-1">{errors.cargo}</p>}
                            </div>
                        </div>

                        {/* Email | Teléfono */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelCls}>Email</label>
                                <input type="email" value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    placeholder="correo@institucion.edu"
                                    className={inputCls + (errors.email ? ' border-red-400' : '')} />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>
                            <div>
                                <label className={labelCls}>Teléfono</label>
                                <input type="text" value={data.telefono}
                                    onChange={e => setData('telefono', e.target.value)}
                                    placeholder="022345678"
                                    className={inputCls} />
                            </div>
                        </div>

                        {/* Departamento | Tipo */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelCls}>Departamento</label>
                                <input type="text" value={data.departamento}
                                    onChange={e => setData('departamento', e.target.value)}
                                    placeholder="Docencia"
                                    className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>Tipo <span className="text-red-500">*</span></label>
                                <select value={data.tipo}
                                    onChange={e => setData('tipo', e.target.value)}
                                    className={inputCls + (errors.tipo ? ' border-red-400' : '')}>
                                    <option value="docente">Docente</option>
                                    <option value="administrativo">Administrativo</option>
                                    <option value="directivo">Directivo</option>
                                </select>
                                {errors.tipo && <p className="text-red-500 text-xs mt-1">{errors.tipo}</p>}
                            </div>
                        </div>

                        {/* Activo toggle */}
                        <div className="flex items-center gap-3">
                            <button type="button"
                                onClick={() => setData('activo', !data.activo)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                                    ${data.activo ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
                                    ${data.activo ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                {data.activo ? 'Activo en el directorio' : 'Inactivo (oculto)'}
                            </span>
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
                            <Save size={14} />
                            {processing ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
