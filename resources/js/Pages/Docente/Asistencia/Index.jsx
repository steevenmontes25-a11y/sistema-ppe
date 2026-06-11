import { useState, useEffect, useMemo, useRef } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { createPortal } from 'react-dom';
import { Save, Users, CheckCircle2 } from 'lucide-react';
import DocenteLayout   from '@/Layouts/DocenteLayout';
import FilaEstudiante  from './components/FilaEstudiante';
import HistorialFechas from './components/HistorialFechas';

// ── FlashToast ────────────────────────────────────────────────────────────────

function FlashToast({ flash }) {
    const [visible, setVisible] = useState(false);
    const [msg,     setMsg]     = useState('');
    const [tipo,    setTipo]    = useState('success');

    useEffect(() => {
        const text = flash?.success ?? flash?.error ?? null;
        if (text) {
            setMsg(text); setTipo(flash?.success ? 'success' : 'error'); setVisible(true);
            const t = setTimeout(() => setVisible(false), 4500);
            return () => clearTimeout(t);
        }
    }, [flash?.success, flash?.error]);

    if (!visible) return null;
    const cls = tipo === 'success'
        ? 'bg-green-100 dark:bg-green-900/40 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200'
        : 'bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200';
    return createPortal(
        <div className={`fixed top-5 right-5 z-50 border rounded-xl px-4 py-3 text-sm font-medium shadow-lg max-w-sm ${cls}`}>
            {msg}
        </div>,
        document.body
    );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function esFinDeSemana(fechaStr) {
    const d = new Date(fechaStr + 'T00:00:00');
    return d.getDay() === 0 || d.getDay() === 6;
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function AsistenciaIndex({
    estudiantes,
    cursosAsignados,
    cursoSeleccionado,
    periodoActivo,
    fechaSeleccionada,
    fechasRegistradas,
    yaRegistrada,
}) {
    const { props }  = usePage();
    const [asistencias, setAsistencias] = useState({});
    const [saving, setSaving]           = useState(false);
    const estadoInicial                 = useRef({});

    // Inicializar estado local al cambiar fecha/curso
    useEffect(() => {
        const init = {};
        estudiantes.forEach(est => {
            init[est.id] = est.asistencia_hoy
                ? { estado: est.asistencia_hoy.estado, observacion: est.asistencia_hoy.observacion || '' }
                : { estado: 'presente', observacion: '' };
        });
        setAsistencias(init);
        estadoInicial.current = JSON.parse(JSON.stringify(init));
    }, [fechaSeleccionada, cursoSeleccionado?.id]);

    // Detectar cambios vs. estado inicial
    const hayBrazos = useMemo(() => {
        return Object.keys(asistencias).some(id => {
            const a = asistencias[id];
            const b = estadoInicial.current[id];
            if (!b) return true;
            return a.estado !== b.estado || (a.observacion || '') !== (b.observacion || '');
        });
    }, [asistencias]);

    const cambiarCurso = (cursoId) => {
        router.get(route('docente.asistencia.index'), {
            curso_id: cursoId,
            fecha:    fechaSeleccionada,
        });
    };

    const cambiarFecha = (nuevaFecha) => {
        const params = { fecha: nuevaFecha };
        if (cursoSeleccionado?.id) params.curso_id = cursoSeleccionado.id;
        router.get(route('docente.asistencia.index'), params);
    };

    const marcarTodos = (estado) => {
        setAsistencias(prev => {
            const next = {};
            Object.keys(prev).forEach(id => {
                next[id] = { ...prev[id], estado };
            });
            return next;
        });
    };

    const onChange = (estudianteId, campo, valor) => {
        setAsistencias(prev => ({
            ...prev,
            [estudianteId]: { ...prev[estudianteId], [campo]: valor },
        }));
    };

    const guardar = () => {
        if (!cursoSeleccionado || estudiantes.length === 0) return;
        setSaving(true);
        router.post(
            route('docente.asistencia.registrar'),
            {
                curso_id:    cursoSeleccionado.id,
                fecha:       fechaSeleccionada,
                asistencias: Object.entries(asistencias).map(([id, data]) => ({
                    estudiante_id: parseInt(id),
                    estado:        data.estado,
                    observacion:   data.observacion || null,
                })),
            },
            {
                preserveScroll: true,
                onFinish: () => setSaving(false),
            }
        );
    };

    const contadorEstados = useMemo(() => {
        const vals = Object.values(asistencias);
        return {
            presentes:    vals.filter(v => v.estado === 'presente').length,
            ausentes:     vals.filter(v => v.estado === 'ausente').length,
            tardanzas:    vals.filter(v => v.estado === 'tardanza').length,
            justificados: vals.filter(v => v.estado === 'justificado').length,
        };
    }, [asistencias]);

    const hoy       = new Date().toISOString().slice(0, 10);
    const finDeSemana = esFinDeSemana(fechaSeleccionada);

    return (
        <DocenteLayout>
            <Head title="Control de Asistencia" />
            <FlashToast flash={props.flash} />

            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-4">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Control de Asistencia</h1>
                    {periodoActivo && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            Período: <span className="font-medium">{periodoActivo.nombre}</span>
                        </p>
                    )}
                </div>

                {/* Barra de controles */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Tabs de curso */}
                            {cursosAsignados.length > 0 && (
                                <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                                    {cursosAsignados.map(c => (
                                        <button key={c.id}
                                            onClick={() => cambiarCurso(c.id)}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
                                                ${cursoSeleccionado?.id === c.id
                                                    ? 'bg-white dark:bg-gray-600 text-purple-700 dark:text-purple-300 shadow-sm'
                                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                                                }`}>
                                            {c.nombre}{c.paralelo ? ` ${c.paralelo}` : ''}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Date picker */}
                            <input
                                type="date"
                                value={fechaSeleccionada}
                                max={hoy}
                                onChange={e => cambiarFecha(e.target.value)}
                                className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-600
                                    bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200
                                    rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>

                        {/* Badge de estado */}
                        {cursoSeleccionado && (
                            yaRegistrada ? (
                                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold rounded-xl border border-green-200 dark:border-green-700">
                                    <CheckCircle2 size={13} /> Ya registrada — editando
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-600">
                                    📋 Nueva lista
                                </span>
                            )
                        )}
                    </div>
                </div>

                {/* Aviso fin de semana */}
                {finDeSemana && (
                    <div className="flex items-center gap-2.5 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl px-4 py-3 text-sm text-yellow-800 dark:text-yellow-200">
                        ⚠️ Estás registrando asistencia en fin de semana ({fechaSeleccionada})
                    </div>
                )}

                {/* Sin cursos asignados */}
                {cursosAsignados.length === 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-16 text-center">
                        <Users size={40} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                            No tienes cursos asignados en el período activo
                        </p>
                    </div>
                )}

                {/* Tabla + acciones */}
                {cursoSeleccionado && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">

                        {/* Acciones rápidas */}
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mr-1">
                                Marcar todos:
                            </span>
                            <button onClick={() => marcarTodos('presente')}
                                className="px-3 py-1.5 text-xs font-medium text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                                ✅ Presente
                            </button>
                            <button onClick={() => marcarTodos('ausente')}
                                className="px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                ❌ Ausente
                            </button>
                            <button onClick={() => {
                                setAsistencias(prev => {
                                    const next = {};
                                    Object.keys(prev).forEach(id => { next[id] = { estado: 'presente', observacion: '' }; });
                                    return next;
                                });
                            }}
                                className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                Limpiar
                            </button>

                            {/* Mini contador */}
                            <div className="ml-auto flex gap-3 text-[11px] text-gray-500 dark:text-gray-400">
                                <span>✅ {contadorEstados.presentes}</span>
                                <span>❌ {contadorEstados.ausentes}</span>
                                {contadorEstados.tardanzas > 0 && <span>⏰ {contadorEstados.tardanzas}</span>}
                                {contadorEstados.justificados > 0 && <span>📝 {contadorEstados.justificados}</span>}
                            </div>
                        </div>

                        {/* Tabla */}
                        {estudiantes.length === 0 ? (
                            <div className="p-12 text-center">
                                <Users size={36} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    No hay estudiantes asignados a este curso
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-700/50 text-left">
                                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                                Estudiante
                                            </th>
                                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                                Estado
                                            </th>
                                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                                Observación
                                            </th>
                                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                                Este mes
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {estudiantes.map(est => (
                                            <FilaEstudiante
                                                key={est.id}
                                                estudiante={est}
                                                asistencia={asistencias[est.id]}
                                                onChange={(campo, valor) => onChange(est.id, campo, valor)}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Footer de guardado */}
                        {estudiantes.length > 0 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                                        {Object.keys(asistencias).length}
                                    </span> de <span className="font-semibold text-gray-700 dark:text-gray-300">
                                        {estudiantes.length}
                                    </span> estudiantes marcados
                                </p>
                                <button
                                    onClick={guardar}
                                    disabled={saving || !hayBrazos || estudiantes.length === 0}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                        text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
                                    <Save size={15} />
                                    {saving ? 'Guardando...' : 'Guardar Asistencia'}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Historial de fechas */}
                {fechasRegistradas.length > 0 && (
                    <HistorialFechas
                        fechas={fechasRegistradas}
                        fechaActual={fechaSeleccionada}
                        cursoId={cursoSeleccionado?.id}
                    />
                )}
            </div>
        </DocenteLayout>
    );
}
