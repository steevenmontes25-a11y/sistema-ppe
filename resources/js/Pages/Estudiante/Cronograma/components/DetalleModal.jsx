import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from '@inertiajs/react';
import { X, FileText, Upload, AlignLeft, Image, Edit2, Trash2 } from 'lucide-react';
import PdfViewerModal from '@/Pages/Docente/Calificaciones/components/PdfViewerModal';

// ── Helpers ───────────────────────────────────────────────────────────────────

function normFecha(s) { return s ? String(s).slice(0, 10) : ''; }
function formatFecha(s) {
    if (!s) return '—';
    const [y, m, d] = normFecha(s).split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
}

function puedeEditar(entrega, actividad) {
    if (!entrega) return false;
    if (entrega.calificacion) return false;
    if (!actividad?.fecha_finalizacion) return true;
    const fin = new Date(normFecha(actividad.fecha_finalizacion) + 'T23:59:59');
    return fin > new Date();
}

function formatSize(bytes) {
    if (!bytes) return '';
    if (bytes < 1024)         return `${bytes} B`;
    if (bytes < 1024 * 1024)  return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Constantes módulo ─────────────────────────────────────────────────────────

const HEADER_GRAD = {
    calificada: 'from-green-700 to-green-900',
    entregada:  'from-blue-700 to-blue-900',
    vencida:    'from-red-700 to-red-900',
    pendiente:  'from-gray-600 to-gray-800',
};

const ESTADO_BADGE = {
    calificada: 'bg-green-100 text-green-800',
    entregada:  'bg-blue-100 text-blue-800',
    vencida:    'bg-red-100 text-red-800',
    pendiente:  'bg-gray-100 text-gray-800',
};

const ESTADO_LABEL = {
    calificada: '✅ Calificada',
    entregada:  '📤 Entregada',
    vencida:    '🔴 Vencida',
    pendiente:  '⏳ Pendiente',
};

const NOTA_COLOR = {
    green:  'text-green-600 dark:text-green-400',
    blue:   'text-blue-600 dark:text-blue-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    red:    'text-red-600 dark:text-red-400',
};

const BAR_COLOR = { green: '#16a34a', blue: '#2563eb', yellow: '#d97706', red: '#dc2626' };

const TIPO_TAB = {
    pdf:   { icon: FileText,  label: 'PDF',   accept: '.pdf' },
    foto:  { icon: Image,     label: 'Foto',  accept: 'image/*' },
    texto: { icon: AlignLeft, label: 'Texto', accept: null },
};

function notaColorKey(nota) {
    const n = parseFloat(nota) || 0;
    if (n >= 9) return 'green';
    if (n >= 7) return 'blue';
    if (n >= 5) return 'yellow';
    return 'red';
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function DetalleModal({
    isOpen, onClose, bitacora, modoInicial = 'ver', onEliminar,
}) {
    const fileInputRef              = useRef(null);
    const [pdfOpen, setPdfOpen]     = useState(false);
    const [modoEdicion, setModoEdicion]   = useState(false);
    const [dragOver, setDragOver]         = useState(false);
    const [preview, setPreview]           = useState(null);
    const [tipoEntrega, setTipoEntrega]   = useState('pdf');

    const { data, setData, post, processing, errors, reset } = useForm({
        descripcion:     '',
        tipo_entrega:    'pdf',
        archivo:         null,
        texto_contenido: '',
    });

    useEffect(() => {
        if (isOpen && bitacora?.entrega) {
            const tipo = bitacora.entrega.archivo_tipo || 'pdf';
            setTipoEntrega(tipo);
            setData({
                descripcion:     bitacora.entrega.descripcion || '',
                tipo_entrega:    tipo,
                archivo:         null,
                texto_contenido: '',
            });
            setPdfOpen(false);
            setPreview(null);
            setDragOver(false);
            setModoEdicion(modoInicial === 'editar');
        }
    }, [isOpen, bitacora?.entrega?.id, modoInicial]);

    if (!isOpen || !bitacora?.entrega) return null;

    const { numero_global, nombre, estado, actividad, entrega } = bitacora;
    const calificacion = entrega?.calificacion;
    const colorKey     = calificacion?.nota ? notaColorKey(calificacion.nota) : 'red';
    const notaPct      = calificacion?.nota
        ? Math.round((parseFloat(calificacion.nota) / 10) * 100) : 0;

    const esPdfOFoto  = entrega.archivo_tipo === 'pdf' || entrega.archivo_tipo === 'foto';
    const esTexto     = entrega.archivo_tipo === 'texto';
    const puedeEdit   = puedeEditar(entrega, actividad);

    // ── Handlers edición ─────────────────────────────────────────────────────

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
        handleFile(e.dataTransfer.files[0]);
    };

    const handleGuardar = () => {
        post(route('estudiante.cronograma.actualizar', entrega.id), {
            forceFormData: true,
            onSuccess: () => setModoEdicion(false),
        });
    };

    const cancelarEdicion = () => {
        const tipo = entrega.archivo_tipo || 'pdf';
        setTipoEntrega(tipo);
        setData({
            descripcion:     entrega.descripcion || '',
            tipo_entrega:    tipo,
            archivo:         null,
            texto_contenido: '',
        });
        setPreview(null);
        setModoEdicion(false);
    };

    const textLen = (data.texto_contenido || '').length;
    const descLen = (data.descripcion || '').length;

    // ── MODO EDICIÓN ─────────────────────────────────────────────────────────

    if (modoEdicion) {
        const editModal = (
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
                                    ✏️ Editar Bitácora #{numero_global}
                                </h2>
                                <p className="text-purple-200 text-sm truncate mt-0.5">{nombre}</p>
                            </div>
                            <button onClick={onClose}
                                className="shrink-0 text-purple-200 hover:text-white transition-colors mt-0.5">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex flex-col gap-5 p-6">

                        {/* Aviso */}
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl px-4 py-3">
                            <p className="text-xs text-yellow-800 dark:text-yellow-200">
                                ℹ️ Si subes un nuevo archivo reemplazará el anterior.
                                Si no seleccionas archivo, se conserva el actual.
                            </p>
                        </div>

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
                                                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-purple-400'
                                            }`}>
                                        <Icon size={13} />
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Zona de archivo */}
                        {tipoEntrega !== 'texto' ? (
                            <div>
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                                    Nuevo archivo <span className="font-normal normal-case">(opcional)</span>
                                </p>

                                {data.archivo ? (
                                    <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20
                                        border border-purple-200 dark:border-purple-700 rounded-xl">
                                        {tipoEntrega === 'foto' && preview ? (
                                            <img src={preview} alt="preview"
                                                className="w-14 h-14 rounded-lg object-cover shrink-0" />
                                        ) : (
                                            <FileText size={32} className="text-purple-500 shrink-0" />
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                                                {data.archivo.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {formatSize(data.archivo.size)}
                                            </p>
                                        </div>
                                        <button type="button"
                                            onClick={() => { setData('archivo', null); setPreview(null); }}
                                            className="text-gray-400 hover:text-red-500 transition-colors">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        onDrop={handleDrop}
                                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                        onDragLeave={() => setDragOver(false)}
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors
                                            ${dragOver
                                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10'
                                            }`}>
                                        <Upload size={28} className="mx-auto text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Arrastra un archivo aquí o haz clic para seleccionar
                                        </p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                            Máximo 10 MB
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
                            </div>
                        ) : (
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                        Contenido
                                    </p>
                                    <span className={`text-[11px] ${textLen > 4500 ? 'text-red-500' : 'text-gray-400'}`}>
                                        {textLen}/5000
                                    </span>
                                </div>
                                <textarea
                                    rows={7}
                                    value={data.texto_contenido}
                                    onChange={e => setData('texto_contenido', e.target.value)}
                                    maxLength={5000}
                                    placeholder="Escribe el contenido actualizado de tu bitácora..."
                                    className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700
                                        bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200
                                        rounded-xl outline-none resize-none
                                        focus:ring-2 focus:ring-purple-400 focus:border-transparent
                                        placeholder:text-gray-300 dark:placeholder:text-gray-600"
                                />
                            </div>
                        )}

                        {/* Comentario */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                    Comentario <span className="font-normal normal-case">(opcional)</span>
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
                    </div>

                    {/* Footer edición */}
                    <div className="shrink-0 flex items-center justify-between gap-3
                        px-6 py-4 border-t border-gray-100 dark:border-gray-700">
                        <button type="button" onClick={cancelarEdicion}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium
                                text-gray-600 dark:text-gray-400
                                border border-gray-200 dark:border-gray-700 rounded-xl
                                hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            ← Cancelar edición
                        </button>
                        <button
                            onClick={handleGuardar}
                            disabled={processing}
                            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold
                                bg-purple-600 hover:bg-purple-700 text-white rounded-xl
                                disabled:opacity-50 disabled:cursor-not-allowed
                                transition-colors shadow-sm">
                            {processing ? '⏳ Guardando...' : '💾 Guardar cambios'}
                        </button>
                    </div>
                </div>
            </div>
        );

        return createPortal(editModal, document.body);
    }

    // ── MODO VER ─────────────────────────────────────────────────────────────

    const modal = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}>

            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <div className="relative z-[10000] w-full max-w-2xl max-h-[90vh] overflow-y-auto
                bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col">

                {/* Header */}
                <div className={`shrink-0 bg-gradient-to-r ${HEADER_GRAD[estado] ?? HEADER_GRAD.pendiente} px-6 py-4 rounded-t-2xl`}>
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <h2 className="text-white font-bold text-base">
                                Bitácora #{numero_global} — {nombre}
                            </h2>
                            <span className={`inline-flex mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${ESTADO_BADGE[estado]}`}>
                                {ESTADO_LABEL[estado]}
                            </span>
                        </div>
                        <button onClick={onClose}
                            className="shrink-0 text-white/70 hover:text-white transition-colors mt-0.5">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex flex-col md:flex-row gap-0 flex-1 min-h-0">

                    {/* ── COLUMNA IZQUIERDA — Entrega ── */}
                    <div className="md:w-[55%] p-5 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700 flex flex-col gap-3">
                        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Tu entrega
                        </h3>

                        {esPdfOFoto && (
                            <button type="button" onClick={() => setPdfOpen(true)}
                                className="w-full flex items-center justify-center gap-3 py-7
                                    border-2 border-dashed border-purple-300 dark:border-purple-700
                                    rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20
                                    transition-colors cursor-pointer">
                                <FileText size={30} className="text-purple-400 shrink-0" />
                                <div className="text-left min-w-0">
                                    <p className="font-medium text-gray-700 dark:text-gray-300 truncate text-sm">
                                        {entrega.archivo_nombre || 'Archivo adjunto'}
                                    </p>
                                    <p className="text-xs text-purple-600 dark:text-purple-400">
                                        Clic para ver el archivo
                                    </p>
                                </div>
                            </button>
                        )}

                        {esTexto && (
                            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
                                    Contenido
                                </p>
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                    {entrega.archivo_nombre}
                                </p>
                            </div>
                        )}

                        <div className="text-[11px] text-gray-400 dark:text-gray-500 space-y-1">
                            {entrega.archivo_nombre && !esTexto && (
                                <p className="truncate font-medium text-gray-600 dark:text-gray-400">
                                    {entrega.archivo_nombre}
                                </p>
                            )}
                            {entrega.fecha_entrega && (
                                <p>Entregado: {formatFecha(entrega.fecha_entrega)}</p>
                            )}
                        </div>

                        {entrega.descripcion && (
                            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl px-3 py-2.5 border border-gray-100 dark:border-gray-700">
                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
                                    Tu comentario
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 italic leading-relaxed">
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

                        {calificacion ? (
                            <>
                                <div className="text-center py-3">
                                    <span className={`text-6xl font-bold ${NOTA_COLOR[colorKey]}`}>
                                        {parseFloat(calificacion.nota).toFixed(1)}
                                    </span>
                                    <span className="text-2xl text-gray-400 dark:text-gray-600"> / 10</span>
                                    <div className="mt-3 w-full h-2 rounded-full bg-gray-100 dark:bg-gray-700">
                                        <div className="h-2 rounded-full transition-all duration-700"
                                            style={{ width: `${notaPct}%`, backgroundColor: BAR_COLOR[colorKey] }} />
                                    </div>
                                </div>
                                {calificacion.fecha_calificacion && (
                                    <p className="text-xs text-center text-gray-400 dark:text-gray-500 -mt-2">
                                        Calificado el {formatFecha(calificacion.fecha_calificacion)}
                                    </p>
                                )}
                                {calificacion.justificacion && (
                                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-xl px-4 py-3">
                                        <p className="text-[10px] font-bold text-purple-500 dark:text-purple-400 uppercase tracking-wide mb-1.5">
                                            Retroalimentación del docente
                                        </p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">
                                            "{calificacion.justificacion}"
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-5 text-center">
                                <p className="text-2xl mb-2">⏳</p>
                                <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                                    Esperando calificación
                                </p>
                                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1 leading-relaxed">
                                    Tu docente revisará tu entrega próximamente.
                                </p>
                                {entrega.fecha_entrega && (
                                    <p className="text-[11px] text-yellow-600 dark:text-yellow-400 mt-3">
                                        Entregada el {formatFecha(entrega.fecha_entrega)}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="shrink-0 flex items-center justify-between gap-3
                    px-6 py-4 border-t border-gray-100 dark:border-gray-700">

                    {/* Botones izquierda: editar/eliminar si puede */}
                    <div className="flex items-center gap-2">
                        {puedeEdit && (
                            <>
                                <button onClick={() => onEliminar?.(bitacora)}
                                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium
                                        border border-red-300 dark:border-red-700
                                        text-red-600 dark:text-red-400
                                        hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                                    <Trash2 size={13} />
                                    Eliminar
                                </button>
                                <button onClick={() => setModoEdicion(true)}
                                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium
                                        border border-purple-300 dark:border-purple-700
                                        text-purple-700 dark:text-purple-300
                                        hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-colors">
                                    <Edit2 size={13} />
                                    Editar
                                </button>
                            </>
                        )}
                    </div>

                    <button onClick={onClose}
                        className="px-5 py-2 text-sm font-medium text-gray-600 dark:text-gray-400
                            border border-gray-200 dark:border-gray-700 rounded-xl
                            hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {createPortal(modal, document.body)}
            {pdfOpen && esPdfOFoto && (
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
