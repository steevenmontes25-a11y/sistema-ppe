import { useEffect } from 'react';
import { X } from 'lucide-react';

// Modal reutilizable con fondo oscuro y cierre con Escape
export default function Modal({ open, onClose, title, children, size = 'md' }) {
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        if (open) {
            document.addEventListener('keydown', handler);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handler);
            document.body.style.overflow = '';
        };
    }, [open, onClose]);

    if (!open) return null;

    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] flex flex-col`}>
                {/* Header del modal */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="text-base font-semibold text-secondary-900">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-secondary-400 hover:text-secondary-600 hover:bg-gray-100 rounded-lg p-1.5 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
                {/* Contenido del modal */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {children}
                </div>
            </div>
        </div>
    );
}
