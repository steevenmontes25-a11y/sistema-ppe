import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Filter, X } from 'lucide-react';

const ESTADOS = [
    { value: '',          label: 'Todos los estados' },
    { value: 'entregada', label: 'Entregada'          },
    { value: 'revisada',  label: 'Revisada'           },
    { value: 'devuelta',  label: 'Devuelta'           },
];

const selectCls = 'px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none';
const inputCls  = 'px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none w-28';

export default function FiltrosBitacoras({ filtros, cursos, docentes }) {
    const [form, setForm] = useState({
        curso_id:     filtros?.curso_id     ?? '',
        docente_id:   filtros?.docente_id   ?? '',
        estado:       filtros?.estado       ?? '',
        bitacora_num: filtros?.bitacora_num ?? '',
    });

    const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

    const aplicar = () => {
        router.get(route('admin.bitacoras.index'), form, {
            preserveState: true, preserveScroll: true,
        });
    };

    const limpiar = () => {
        const reset = { curso_id: '', docente_id: '', estado: '', bitacora_num: '' };
        setForm(reset);
        router.get(route('admin.bitacoras.index'), reset, {
            preserveState: true, preserveScroll: true,
        });
    };

    const hayFiltros = Object.values(form).some(v => v !== '' && v !== null);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex flex-wrap gap-3 items-end">

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

                <div className="flex flex-col gap-1 min-w-[180px]">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Docente calificador</label>
                    <select value={form.docente_id} onChange={e => set('docente_id', e.target.value)} className={selectCls}>
                        <option value="">Todos los docentes</option>
                        {(docentes || []).map(d => (
                            <option key={d.id} value={d.id}>
                                {d.apellidos && d.nombres ? `${d.apellidos}, ${d.nombres}` : `Docente #${d.id}`}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1 min-w-[140px]">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Estado</label>
                    <select value={form.estado} onChange={e => set('estado', e.target.value)} className={selectCls}>
                        {ESTADOS.map(e => (
                            <option key={e.value} value={e.value}>{e.label}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">N° Bitácora</label>
                    <input type="number" min="1" max="99"
                        value={form.bitacora_num}
                        onChange={e => set('bitacora_num', e.target.value)}
                        placeholder="Ej: 3"
                        className={inputCls} />
                </div>

                <div className="flex gap-2 ml-auto">
                    {hayFiltros && (
                        <button onClick={limpiar}
                            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <X size={14} /> Limpiar
                        </button>
                    )}
                    <button onClick={aplicar}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                        <Filter size={14} /> Filtrar
                    </button>
                </div>
            </div>
        </div>
    );
}
