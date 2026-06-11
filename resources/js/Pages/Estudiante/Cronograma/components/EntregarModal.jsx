import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from '@inertiajs/react';
import { X, FileText, Image, AlignLeft, Upload } from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────

function normFecha(s) { return s ? String(s).slice(0, 10) : ''; }
function formatFecha(s) {
    if (!s) return '—';
    const [y, m, d] = normFecha(s).split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
}

function formatSize(bytes) {
    if (!bytes) return '';
    if (bytes < 1024)         return `${bytes} B`;
    if (bytes < 1024 * 1024)  return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Constantes módulo ─────────────────────────────────────────────────────────

const TIPO_TAB = {
    pdf:   { icon: FileText, label: 'PDF',   accept: '.pdf',      mime: 'application/pdf' },
    foto:  { icon: Image,    label: 'Foto',  accept: 'image/*',   mime: 'image/*' },
    texto: { icon: AlignLeft,label: 'Texto', accept: null,        mime: null },
};

// ── Componente ────────────────────────────────────────────────────────────────

export default function EntregarModal({ isOpen, onClose, bitacora }) {
    const fileInputRef  = useRef(null);
    const [dragOver, setDragOver]       = useState(false);
    const [preview, setPreview]         = useState(null);
    const [confirmado, setConfirmado]   = useState(false);
    const [tipoEntrega, setTipoEntrega] = useState('pdf');

    const { data, setData, post, processing, errors, reset } = useForm({
        bitacora_config_id: '',
        descripcion:        '',
        tipo_entrega:       'pdf',
        archivo:            null,
        texto_contenido:    '',
    });

    useEffect(() => {
        if (isOpen && bitacora) {
            const tipo = bitacora.actividad?.tipo_entrega === 'texto' ? 'texto' : 'pdf';
            setTipoEntrega(tipo);
            reset();
            setData({
                bitacora_config_id: bitacora.id,
                descripcion:        '',
                tipo_entrega:       tipo,
                archivo:            null,
                texto_contenido:    '',
            });
            setPreview(null);
            setConfirmado(false);
            setDragOver(false);
        }
    }, [isOpen, bitacora?.id]);

    const cambiarTipo = (tipo) => {
        setTipoEntrega(tipo);
        setData('tipo_entrega', tipo);
        setData('archivo', null);
        setPreview(null);
    };

    const handleFile = (file) => {
        if (!file) return;
        setData('archivo', file);
        if (tipoEntrega === 'foto') {
            const reader = new FileReader();
            reader.onload = (e) => setPreview(e.target.result);
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const handleSubmit = () => {
        post(route('estudiante.cronograma.entregar'), {
            forceFormData: true,
            onSuccess: () => { reset(); onClose(); },
        });
    };

    const canSubmit = confirmado && !processing &&
        (tipoEntrega === 'texto'
            ? data.texto_contenido.trim().length > 0
            : data.archivo !== null);

    if (!isOpen || !bitacora) return null;

    const { actividad } = bitacora;
    const textLen = (data.texto_contenido || '').length;
    const descLen = (data.descripcion || '').length;

    const modal = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}>

            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <div className="relative z-[10000] w-full max-w-2xl max-h-[92vh] overflow-y-auto
                bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col">

                {/* Header */}
                <div className="shrink-0 bg-gradient-to-r from-purple-700 to-purple-900 px-6 py-4 rounded-t-2xl">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <h2 className="text-white font-bold text-base">
                                📤 Entregar Bitácora #{bitacora.numero_global}
                            </h2>
                            <p className="text-purple-200 text-sm truncate mt-0.5">{bitacora.nombre}</p>
                        </div>
                        <button onClick={onClose}
                            className="shrink-0 text-purple-200 hover:text-white transition-colors mt-0.5">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex flex-col gap-5 p-6">

                    {/* Info actividad */}
                    {actividad && (
                        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-xl p-4">
                            <p className="text-xs font-bold text-purple-500 dark:text-purple-400 uppercase tracking-wide mb-1">
                                Actividad
                            </p>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1">
                                📋 {actividad.titulo}
                            </p>
                            {actividad.descripcion && (
                                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                                    {actividad.descripcion}
                                </p>
                            )}
                            <div className="grid grid-cols-3 gap-2 text-center">
                                {[
                                    { label: 'Inicio',   valor: actividad.fecha_inicio },
                                    { label: 'Entrega',  valor: actividad.fecha_entrega },
                                    { label: 'Cierre',   valor: actividad.fecha_finalizacion },
                                ].map(({ label, valor }) => (
                                    <div key={label} className="bg-white dark:bg-gray-800 rounded-lg px-2 py-2">
                                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">{label}</p>
                                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-0.5">{formatFecha(valor)}</p>
                                    </div>
                                ))}
                            </div>
                            {actividad.puntaje_maximo && (
                                <p className="mt-2 text-xs text-purple-700 dark:text-purple-300 font-medium">
                                    ⭐ Puntaje máximo: {actividad.puntaje_maximo}/10
                                </p>
                            )}
                        </div>
                    )}

                    {/* Selector de tipo */}
                    <div>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                            Tipo de entrega
                        </p>
                        <div className="flex gap-2">
                            {Object.entries(TIPO_TAB).map(([key, { icon: Icon, label }]) => (
                                <button key={key} type="button"
                                    onClick={() => cambiarTipo(key)}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors
                                        ${tipoEntrega === key
                                            ? 'bg-purple-600 border-purple-600 text-white'
                                            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-purple-400 dark:hover:border-purple-600'
                                        }`}>
                                    <Icon size={13} />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Zona de subida */}
                    {tipoEntrega !== 'texto' ? (
                        <div>
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                                {tipoEntrega === 'pdf' ? 'Archivo PDF' : 'Imagen'}
                            </p>

                            {data.archivo ? (
                                <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20
                                    border border-purple-200 dark:border-purple-700 rounded-xl">
                                    {tipoEntrega === 'foto' && preview ? (
                                        <img src={preview} alt="preview"
                                            className="w-16 h-16 rounded-lg object-cover shrink-0 border border-purple-200" />
                                    ) : (
                                        <FileText size={36} className="text-purple-500 shrink-0" />
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                                            {data.archivo.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {formatSize(data.archivo.size)}
                                        </p>
                                    </div>
                                    <button type="button"
                                        onClick={() => { setData('archivo', null); setPreview(null); }}
                                        className="shrink-0 text-gray-400 hover:text-red-500 transition-colors">
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    onDrop={handleDrop}
                                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
                                        ${dragOver
                                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                                            : 'border-purple-300 dark:border-purple-700 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                                        }`}>
                                    <Upload size={36} className="mx-auto text-purple-400 mb-3" />
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {tipoEntrega === 'pdf'
                                            ? 'Arrastra tu PDF aquí o haz clic para seleccionar'
                                            : 'Arrastra tu imagen aquí o haz clic para seleccionar'}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                        {tipoEntrega === 'pdf' ? 'PDF' : 'JPG, PNG, GIF'} · Máximo 10 MB
                                    </p>
                                </div>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={TIPO_TAB[tipoEntrega]?.accept ?? '*'}
                                className="hidden"
                                onChange={e => handleFile(e.target.files?.[0])}
                            />

                            {errors.archivo && (
                                <p className="mt-1 text-xs text-red-500">{errors.archivo}</p>
                            )}
                        </div>
                    ) : (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                    Contenido de la bitácora
                                </p>
                                <span className={`text-[11px] ${textLen > 4500 ? 'text-red-500' : 'text-gray-400'}`}>
                                    {textLen}/5000
                                </span>
                            </div>
                            <textarea
                                rows={8}
                                value={data.texto_contenido}
                                onChange={e => setData('texto_contenido', e.target.value)}
                                maxLength={5000}
                                placeholder="Escribe el contenido de tu bitácora aquí..."
                                className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700
                                    bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200
                                    rounded-xl outline-none resize-none
                                    focus:ring-2 focus:ring-purple-400 focus:border-transparent
                                    placeholder:text-gray-300 dark:placeholder:text-gray-600"
                            />
                            {errors.texto_contenido && (
                                <p className="mt-1 text-xs text-red-500">{errors.texto_contenido}</p>
                            )}
                        </div>
                    )}

                    {/* Comentario */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                Comentario para tu docente <span className="font-normal normal-case text-gray-400">(opcional)</span>
                            </p>
                            <span className="text-[11px] text-gray-400">{descLen}/1000</span>
                        </div>
                        <textarea
                            rows={3}
                            value={data.descripcion}
                            onChange={e => setData('descripcion', e.target.value)}
                            maxLength={1000}
                            placeholder="Agrega un comentario o nota para tu docente..."
                            className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700
                                bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200
                                rounded-xl outline-none resize-none
                                focus:ring-2 focus:ring-purple-400 focus:border-transparent
                                placeholder:text-gray-300 dark:placeholder:text-gray-600"
                        />
                    </div>

                    {/* Confirmación */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4">
                        <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-3 uppercase tracking-wide">
                            Confirmación
                        </p>
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={confirmado}
                                onChange={e => setConfirmado(e.target.checked)}
                                className="mt-0.5 w-4 h-4 rounded border-blue-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                            />
                            <span className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                                ☑️ Revisé mi trabajo antes de entregar y es mi trabajo original.
                                Entiendo que <strong>no podré modificar esta entrega</strong> una vez enviada.
                            </span>
                        </label>
                    </div>

                </div>

                {/* Footer */}
                <div className="shrink-0 flex items-center justify-end gap-3
                    px-6 py-4 border-t border-gray-100 dark:border-gray-700">
                    <button type="button" onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400
                            border border-gray-200 dark:border-gray-700 rounded-xl
                            hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        className="flex items-center gap-2 px-5 py-2 text-sm font-semibold
                            bg-purple-600 hover:bg-purple-700 text-white rounded-xl
                            disabled:opacity-50 disabled:cursor-not-allowed
                            transition-colors shadow-sm">
                        {processing ? '⏳ Enviando...' : '📤 Entregar Bitácora'}
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
}
