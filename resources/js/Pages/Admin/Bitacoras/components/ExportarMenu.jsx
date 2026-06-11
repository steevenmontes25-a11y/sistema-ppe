import { useState, useEffect, useRef } from 'react';
import { Download, ChevronDown, FileSpreadsheet, FileText } from 'lucide-react';

export default function ExportarMenu({ filtros }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const qs = new URLSearchParams(
        Object.fromEntries(
            Object.entries(filtros || {}).filter(([, v]) => v !== null && v !== '' && v !== undefined)
        )
    ).toString();
    const suffix = qs ? '?' + qs : '';

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
                <Download size={15} />
                Exportar
                <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-1.5 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-20 overflow-hidden">
                    <a
                        href={route('admin.bitacoras.exportar.excel') + suffix}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-700 dark:text-green-400 text-sm transition-colors">
                        <FileSpreadsheet size={16} />
                        <div>
                            <p className="font-medium">Exportar a Excel</p>
                            <p className="text-xs opacity-70">Archivo .csv compatible</p>
                        </div>
                    </a>
                    <div className="border-t border-gray-100 dark:border-gray-700" />
                    <a
                        href={route('admin.bitacoras.exportar.pdf') + suffix}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-700 dark:text-red-400 text-sm transition-colors">
                        <FileText size={16} />
                        <div>
                            <p className="font-medium">Exportar a PDF</p>
                            <p className="text-xs opacity-70">Reporte detallado A4</p>
                        </div>
                    </a>
                </div>
            )}
        </div>
    );
}
