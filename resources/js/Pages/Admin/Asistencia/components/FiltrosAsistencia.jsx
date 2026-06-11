import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Filter, X } from 'lucide-react';

const selectCls = 'px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none';
const inputCls  = 'px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none';

export default function FiltrosAsistencia({ filtros, docentes, cursos }) {
    const [form, setForm] = useState({
        fecha_desde: filtros?.fecha_desde ?? '',
        fecha_hasta: filtros?.fecha_hasta ?? '',
        docente_id:  filtros?.docente_id  ?? '',
        curso_id:    filtros?.curso_id    ?? '',
    });

    const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

    const aplicar = () => {
        router.get(route('admin.asistencia.index'), form, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const limpiar = () => {
        const reset = {
            fecha_desde: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                .toISOString().slice(0, 10),
            fecha_hasta: new Date().toISOString().slice(0, 10),
            docente_id: '',
            curso_id:   '',
        };
        setForm(reset);
        router.get(route('admin.asistencia.index'), reset, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const hayFiltros = form.docente_id || form.curso_id
        || form.fecha_desde !== filtros?.fecha_desde
        || form.fecha_hasta !== filtros?.fecha_hasta;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex flex-wrap gap-3 items-end">

                {/* Docente */}
                <div className="flex flex-col gap-1 min-w-[180px]">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Docente</label>
                    <select value={form.docente_id} onChange={e => set('docente_id', e.target.value)} className={selectCls}>
                        <option value="">Todos los docentes</option>
                        {(docentes || []).map(d => (
                            <option key={d.id} value={d.id}>
                                {d.apellidos && d.nombres ? `${d.apellidos}, ${d.nombres}` : d.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Curso */}
                <div className="flex flex-col gap-1 min-w-[160px]">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Curso</label>
                    <select value={form.curso_id} onChange={e => set('curso_id', e.target.value)} className={selectCls}>
                        <option value="">Todos los cursos</option>
                        {(cursos || []).map(c => (
                            <option key={c.id} value={c.id}>
                                {c.nombre}{c.paralelo ? ` — Par. ${c.paralelo}` : ''}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Fecha desde */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Desde</label>
                    <input type="date" value={form.fecha_desde}
                        onChange={e => set('fecha_desde', e.target.value)}
                        className={inputCls} />
                </div>

                {/* Fecha hasta */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Hasta</label>
                    <input type="date" value={form.fecha_hasta}
                        onChange={e => set('fecha_hasta', e.target.value)}
                        className={inputCls} />
                </div>

                {/* Botones */}
                <div className="flex gap-2 ml-auto">
                    {hayFiltros && (
                        <button onClick={limpiar}
                            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <X size={14} />
                            Limpiar
                        </button>
                    )}
                    <button onClick={aplicar}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                        <Filter size={14} />
                        Filtrar
                    </button>
                </div>
            </div>
        </div>
    );
}
