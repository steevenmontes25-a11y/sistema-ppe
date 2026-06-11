import { useState, useRef } from 'react';
import { Upload, File, X, Image } from 'lucide-react';

// Zona de carga de archivos PDF/imágenes con drag & drop
export default function FileUpload({ accept = 'pdf', onChange, value, error }) {
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef(null);

    const acceptMap = {
        pdf:  { accept: '.pdf,application/pdf', icon: File, label: 'PDF', mime: 'application/pdf' },
        foto: { accept: 'image/*',              icon: Image, label: 'Imagen (JPG, PNG)', mime: 'image/*' },
        texto: { accept: '.txt,.doc,.docx',     icon: File, label: 'Documento de texto', mime: '' },
    };

    const config = acceptMap[accept] || acceptMap.pdf;
    const Icon = config.icon;

    const handleFile = (file) => {
        if (file && onChange) onChange(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const handleChange = (e) => {
        const file = e.target.files[0];
        if (file) handleFile(file);
    };

    return (
        <div>
            {value ? (
                <div className="flex items-center gap-3 p-3 bg-primary-50 border border-primary-200 rounded-xl">
                    <Icon className="text-primary-600 flex-shrink-0" size={20} />
                    <span className="text-sm text-primary-700 font-medium truncate flex-1">
                        {value instanceof File ? value.name : value}
                    </span>
                    <button
                        type="button"
                        onClick={() => onChange && onChange(null)}
                        className="text-primary-400 hover:text-red-500 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <div
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
                        transition-colors duration-200
                        ${dragging
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-400 hover:bg-gray-50'
                        }
                        ${error ? 'border-red-400 bg-red-50' : ''}
                    `}
                >
                    <Upload className="mx-auto text-secondary-400 mb-2" size={24} />
                    <p className="text-sm font-medium text-secondary-600">
                        Arrastra tu archivo aquí o{' '}
                        <span className="text-primary-600">selecciona uno</span>
                    </p>
                    <p className="text-xs text-secondary-400 mt-1">{config.label}</p>
                </div>
            )}
            <input
                ref={inputRef}
                type="file"
                accept={config.accept}
                onChange={handleChange}
                className="hidden"
            />
            {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
        </div>
    );
}
