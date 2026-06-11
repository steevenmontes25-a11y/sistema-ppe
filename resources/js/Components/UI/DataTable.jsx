import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

// Tabla reutilizable con búsqueda y paginación del lado del cliente
export default function DataTable({
    columns,
    data = [],
    searchable = true,
    searchPlaceholder = 'Buscar...',
    pageSize = 10,
    emptyMessage = 'No hay datos disponibles',
}) {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    // Filtrar por búsqueda en todos los campos de texto
    const filtered = searchable && search
        ? data.filter(row =>
            Object.values(row).some(val =>
                String(val).toLowerCase().includes(search.toLowerCase())
            )
        )
        : data;

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    return (
        <div>
            {/* Búsqueda */}
            {searchable && (
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={16} />
                    <input
                        type="text"
                        value={search}
                        onChange={handleSearch}
                        placeholder={searchPlaceholder}
                        className="w-full sm:w-72 pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl
                            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                            bg-gray-50 placeholder-secondary-400"
                    />
                </div>
            )}

            {/* Tabla */}
            <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className="px-4 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider"
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                        {paginated.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-secondary-400">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            paginated.map((row, i) => (
                                <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                                    {columns.map((col) => (
                                        <td key={col.key} className="px-4 py-3 text-sm text-secondary-700 whitespace-nowrap">
                                            {col.render ? col.render(row[col.key], row) : row[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                    <p className="text-xs text-secondary-400">
                        Mostrando {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} de {filtered.length}
                    </p>
                    <div className="flex gap-1">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-100 transition-colors"
                        >
                            <ChevronLeft size={14} />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                            .map((p, idx, arr) => (
                                <span key={p}>
                                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                                        <span className="px-1 text-secondary-400">…</span>
                                    )}
                                    <button
                                        onClick={() => setPage(p)}
                                        className={`w-7 h-7 text-xs rounded-lg border transition-colors
                                            ${currentPage === p
                                                ? 'bg-primary-600 text-white border-primary-600'
                                                : 'border-gray-200 hover:bg-gray-100 text-secondary-600'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                </span>
                            ))
                        }
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-100 transition-colors"
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
