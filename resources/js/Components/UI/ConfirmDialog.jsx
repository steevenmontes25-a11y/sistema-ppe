import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const TIPOS = {
    warning: { icon: '⚠️', btnClass: 'bg-red-600 hover:bg-red-700 text-white' },
    danger:  { icon: '🔴', btnClass: 'bg-red-600 hover:bg-red-700 text-white' },
    success: { icon: '✅', btnClass: 'bg-green-600 hover:bg-green-700 text-white' },
};

export default function ConfirmDialog({
    open,
    titulo,
    mensaje,
    tipo             = 'warning',
    labelConfirmar   = 'Confirmar',
    labelCancelar    = 'Cancelar',
    onConfirm,
    onCancel,
    requireText      = null,
}) {
    const [inputText, setInputText] = useState('');

    useEffect(() => {
        if (!open) setInputText('');
    }, [open]);

    if (!open) return null;

    const { icon, btnClass } = TIPOS[tipo] || TIPOS.warning;
    const puedeConfirmar = requireText ? inputText === requireText : true;

    return createPortal(
        <div
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex: 9999 }}
        >
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/70"
                onClick={onCancel}
            />

            {/* Card */}
            <div
                className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-700"
                style={{ zIndex: 10000 }}
                onClick={e => e.stopPropagation()}
            >
                {/* Título */}
                <div className="flex items-start gap-4 mb-4">
                    <span className="text-3xl flex-shrink-0">{icon}</span>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {titulo}
                        </h3>
                        <p
                            className="text-sm text-gray-600 dark:text-gray-400 mt-1"
                            dangerouslySetInnerHTML={{ __html: mensaje }}
                        />
                    </div>
                </div>

                {/* Input de doble confirmación */}
                {requireText && (
                    <div className="mb-2">
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">
                            Escribe{' '}
                            <strong className="text-red-500">"{requireText}"</strong>{' '}
                            para confirmar:
                        </label>
                        <input
                            type="text"
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                            autoFocus
                            placeholder={requireText}
                            className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                        />
                        {inputText && inputText !== requireText && (
                            <p className="text-xs text-red-500 mt-1">El texto no coincide</p>
                        )}
                        {inputText === requireText && inputText !== '' && (
                            <p className="text-xs text-green-500 mt-1">✓ Confirmado</p>
                        )}
                    </div>
                )}

                {/* Botones */}
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        {labelCancelar}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={!puedeConfirmar}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${btnClass}`}
                    >
                        {labelConfirmar}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
