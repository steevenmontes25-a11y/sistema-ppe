import { router } from '@inertiajs/react';
import { BookOpen, Layers, Plus } from 'lucide-react';
import FaseCard from './FaseCard';

export default function CursoFasesPanel({ grupoCurso, onEditar, onCrear, onEliminar }) {
    const { curso, fases } = grupoCurso;
    const totalBitacoras = fases.length * 5;
    const rangoFin       = totalBitacoras > 0 ? totalBitacoras : 0;

    const moverFase = (index, direccion) => {
        const nuevo = [...fases];
        const swap  = index + direccion;
        [nuevo[index], nuevo[swap]] = [nuevo[swap], nuevo[index]];
        const payload = nuevo.map((f, i) => ({ id: f.id, orden: i + 1 }));
        router.patch(route('admin.fases.reordenar'), { fases: payload }, { preserveScroll: true });
    };

    return (
        <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Header del panel */}
            <div className="bg-purple-700 dark:bg-purple-800 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <BookOpen size={16} className="text-purple-200" />
                    <div>
                        <h2 className="text-white font-bold text-sm">{curso.nombre}</h2>
                        {fases.length > 0 ? (
                            <p className="text-purple-200 text-xs">
                                {fases.length} {fases.length === 1 ? 'fase' : 'fases'} · Bitácoras 1–{rangoFin}
                            </p>
                        ) : (
                            <p className="text-purple-300 text-xs">Sin fases configuradas</p>
                        )}
                    </div>
                </div>
                <button
                    onClick={() => onCrear(curso)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-medium rounded-lg transition-colors">
                    <Plus size={12} />
                    Agregar fase
                </button>
            </div>

            {/* Lista de fases */}
            {fases.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 p-10 text-center">
                    <Layers size={32} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Sin fases para este curso</p>
                    <button
                        onClick={() => onCrear(curso)}
                        className="mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-xl transition-colors">
                        + Crear primera fase
                    </button>
                </div>
            ) : (
                <div className="bg-gray-50 dark:bg-gray-900/30 p-4 space-y-3">
                    {fases.map((fase, index) => (
                        <FaseCard
                            key={fase.id}
                            fase={fase}
                            isFirst={index === 0}
                            isLast={index === fases.length - 1}
                            onEditar={onEditar}
                            onMoverArriba={() => moverFase(index, -1)}
                            onMoverAbajo={() => moverFase(index, 1)}
                            onEliminar={onEliminar}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
