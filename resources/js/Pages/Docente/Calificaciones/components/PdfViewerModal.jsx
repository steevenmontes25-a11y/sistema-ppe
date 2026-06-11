import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, FileText, ExternalLink } from 'lucide-react';

// Para producción con dominio real (https://), <object> funciona correctamente.
// Chrome puede bloquear en localhost. Solución: URL absoluta con window.location.origin.

function FallbackViewer({ url }) {
    return (
        <div className="flex flex-col items-center justify-center h-full gap-5 bg-gray-50 dark:bg-gray-800 p-8">
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-2xl">
                <FileText size={48} className="text-purple-400" />
            </div>
            <div className="text-center">
                <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Vista previa no disponible en este navegador
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 max-w-sm">
                    Chrome bloquea la visualización de PDFs locales.
                    Descarga el archivo para verlo.
                </p>
            </div>
            <div className="flex gap-3 flex-wrap justify-center">
                <a href={url} download
                    className="flex items-center gap-2 px-4 py-2
                        bg-purple-600 hover:bg-purple-700
                        text-white rounded-lg text-sm font-medium transition-colors">
                    <Download size={16} />
                    Descargar PDF
                </a>
                <a href={url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2
                        border border-gray-300 dark:border-gray-600
                        text-gray-700 dark:text-gray-300
                        rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <ExternalLink size={16} />
                    Abrir en pestaña
                </a>
            </div>
        </div>
    );
}

export default function PdfViewerModal({ url, nombre, tipo, onClose }) {
    const [vistaError, setVistaError] = useState(false);
    const esPDF = tipo?.toLowerCase().includes('pdf');

    // URL absoluta para evitar bloqueo de Chrome con rutas relativas en localhost
    const urlCompleta = url && url.startsWith('http')
        ? url
        : window.location.origin + '/' + String(url).replace(/^\//, '');

    const modal = (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}>

            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            <div className="relative z-[10002] w-full max-w-5xl flex flex-col
                bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
                style={{ height: '90vh' }}>

                {/* Header */}
                <div className="flex-shrink-0 flex items-center gap-3 px-5 py-3.5
                    bg-gray-900 dark:bg-gray-950">
                    <p className="flex-1 text-white text-sm font-medium truncate min-w-0">
                        {nombre || 'Archivo'}
                    </p>
                    <a href={urlCompleta} download={nombre || 'archivo'}
                        className="flex items-center gap-1.5 px-3 py-1.5
                            bg-purple-600 hover:bg-purple-700
                            text-white text-xs font-semibold rounded-lg transition-colors flex-shrink-0">
                        <Download size={13} /> Descargar
                    </a>
                    <button onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors flex-shrink-0">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 min-h-0">
                    {esPDF ? (
                        !vistaError ? (
                            <object
                                data={urlCompleta}
                                type="application/pdf"
                                className="w-full h-full"
                                onError={() => setVistaError(true)}
                            >
                                {/* Fallback cuando <object> no puede renderizar el PDF */}
                                <FallbackViewer url={urlCompleta} />
                            </object>
                        ) : (
                            <FallbackViewer url={urlCompleta} />
                        )
                    ) : (
                        <div className="flex items-center justify-center h-full p-4
                            bg-gray-50 dark:bg-gray-800">
                            <img src={urlCompleta} alt={nombre}
                                className="max-w-full max-h-full object-contain rounded-lg" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
}
