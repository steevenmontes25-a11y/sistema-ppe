import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { LayoutList, LayoutGrid } from 'lucide-react';
import EstudianteLayout from '@/Layouts/EstudianteLayout';
import ResumenGlobal from './components/ResumenGlobal';
import FaseNotas from './components/FaseNotas';
import VistaLista from './components/VistaLista';

export default function MisNotas({ fases, stats, periodoActivo, sinMatricula, curso }) {
    const [modoVista, setModoVista] = useState(
        () => localStorage.getItem('est-notas-vista') || 'fases'
    );

    const cambiarVista = (v) => {
        setModoVista(v);
        localStorage.setItem('est-notas-vista', v);
    };

    if (sinMatricula) {
        return (
            <EstudianteLayout title="Mis Notas">
                <Head title="Mis Notas" />
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <p className="text-5xl mb-4">📋</p>
                    <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">
                        Sin matrícula activa
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                        No estás matriculado en ningún curso del período activo.
                        Contacta a tu coordinador para regularizar tu situación.
                    </p>
                </div>
            </EstudianteLayout>
        );
    }

    return (
        <EstudianteLayout title="Mis Notas">
            <Head title="Mis Notas" />

            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Mis Notas</h1>
                    {curso && periodoActivo && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            {curso.nombre} · {periodoActivo.nombre}
                        </p>
                    )}
                </div>

                {/* Toggle vista */}
                <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-700/60 rounded-xl self-start sm:self-auto">
                    <button
                        onClick={() => cambiarVista('lista')}
                        title="Vista lista"
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                            ${modoVista === 'lista'
                                ? 'bg-white dark:bg-gray-700 text-purple-700 dark:text-purple-300 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}>
                        <LayoutList size={14} />
                        Lista
                    </button>
                    <button
                        onClick={() => cambiarVista('fases')}
                        title="Vista por fases"
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                            ${modoVista === 'fases'
                                ? 'bg-white dark:bg-gray-700 text-purple-700 dark:text-purple-300 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}>
                        <LayoutGrid size={14} />
                        Por Fases
                    </button>
                </div>
            </div>

            {/* Resumen global — siempre visible */}
            <ResumenGlobal stats={stats} />

            {/* Contenido según vista */}
            {modoVista === 'lista' ? (
                <VistaLista fases={fases || []} />
            ) : (
                <>
                    {fases && fases.length > 0 ? (
                        <div className="flex flex-col gap-4">
                            {fases.map((fase, idx) => (
                                <FaseNotas
                                    key={fase.id}
                                    fase={fase}
                                    defaultAbierta={idx === 0}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
                            <p className="text-4xl mb-3">📭</p>
                            <p className="text-sm">No hay fases configuradas para este período.</p>
                        </div>
                    )}
                </>
            )}
        </EstudianteLayout>
    );
}
