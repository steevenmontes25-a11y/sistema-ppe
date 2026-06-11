import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Eye } from 'lucide-react';

// ── Constantes de módulo ──────────────────────────────────────────────────────

const ESTADO_BADGE = {
    entregada: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    revisada:  'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    devuelta:  'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
};

const NOTA_COLOR = (n) => {
    const v = parseFloat(n);
    if (v >= 9) return 'text-green-600 dark:text-green-400 font-bold';
    if (v >= 7) return 'text-blue-600 dark:text-blue-400 font-bold';
    if (v >= 5) return 'text-yellow-600 dark:text-yellow-400 font-semibold';
    return 'text-red-600 dark:text-red-400 font-semibold';
};

function BarraProgreso({ pct }) {
    const color = pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-red-500';
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 w-8 text-right">{pct}%</span>
        </div>
    );
}

// ── Tabla de una bitácora config ──────────────────────────────────────────────

function TablaConfig({ numeroGlobal, bitacorasGrupo, matriculados, onVer }) {
    const submittedIds = useMemo(() =>
        new Set((bitacorasGrupo || []).map(b => b.estudiante_id)),
    [bitacorasGrupo]);

    const noEntrego = useMemo(() =>
        (matriculados || []).filter(m => !submittedIds.has(m.id)),
    [matriculados, submittedIds]);

    const total     = (matriculados || []).length || (bitacorasGrupo || []).length;
    const entregaron = (bitacorasGrupo || []).length;
    const pctEntrega = total > 0 ? Math.round((entregaron / total) * 100) : 0;

    return (
        <div>
            {/* Barra de progreso de entregas */}
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 w-36 flex-shrink-0">
                    Bitácora {numeroGlobal}
                </span>
                <div className="flex-1">
                    <BarraProgreso pct={pctEntrega} />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {entregaron} de {total > 0 ? total : '?'} entregaron
                </span>
            </div>

            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700">
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 dark:text-gray-500">Estudiante</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 dark:text-gray-500">Matrícula</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 dark:text-gray-500">Fecha entrega</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 dark:text-gray-500">Nota</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 dark:text-gray-500">Estado</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 dark:text-gray-500">Ver</th>
                    </tr>
                </thead>
                <tbody>
                    {(bitacorasGrupo || []).map(b => {
                        const nombre = b.estudiante?.nombres
                            ? `${b.estudiante.apellidos}, ${b.estudiante.nombres}`
                            : (b.estudiante?.name ?? '—');
                        const fecha  = b.fecha_entrega
                            ? new Date(b.fecha_entrega.includes('T') ? b.fecha_entrega : b.fecha_entrega + 'T00:00:00')
                                .toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })
                            : '—';

                        return (
                            <tr key={b.id}
                                className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <td className="px-4 py-2.5 font-medium text-xs text-gray-900 dark:text-gray-100">{nombre}</td>
                                <td className="px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400">{b.estudiante?.numero_matricula ?? '—'}</td>
                                <td className="px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400">{fecha}</td>
                                <td className="px-4 py-2.5 text-xs">
                                    {b.calificacion
                                        ? <span className={NOTA_COLOR(b.calificacion.nota)}>{parseFloat(b.calificacion.nota).toFixed(2)}</span>
                                        : <span className="text-gray-300 dark:text-gray-600">—</span>}
                                </td>
                                <td className="px-4 py-2.5">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_BADGE[b.estado] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                                        {b.estado ? (b.estado.charAt(0).toUpperCase() + b.estado.slice(1)) : '—'}
                                    </span>
                                </td>
                                <td className="px-4 py-2.5 text-right">
                                    <button onClick={() => onVer(b)}
                                        className="p-1.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/60 transition-colors">
                                        <Eye size={13} />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}

                    {/* Filas de No Entregó */}
                    {noEntrego.map(est => (
                        <tr key={`ne-${est.id}`} className="border-b border-red-50 dark:border-gray-700/50 bg-red-50/40 dark:bg-red-900/5">
                            <td className="px-4 py-2 text-xs text-gray-400 dark:text-gray-600">
                                {est.apellidos && est.nombres
                                    ? `${est.apellidos}, ${est.nombres}`
                                    : (est.name ?? '—')}
                            </td>
                            <td className="px-4 py-2 text-xs text-gray-300 dark:text-gray-600">{est.numero_matricula}</td>
                            <td className="px-4 py-2 text-xs text-gray-300 dark:text-gray-600">—</td>
                            <td className="px-4 py-2 text-xs text-gray-300 dark:text-gray-600">—</td>
                            <td className="px-4 py-2">
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                                    ❌ N/E
                                </span>
                            </td>
                            <td className="px-4 py-2" />
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function VistaPorCurso({ porCurso, onVerDetalle }) {
    const [closedCursos, setClosedCursos] = useState(new Set());

    const toggle = (id) => {
        setClosedCursos(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    if (!porCurso || porCurso.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                <p className="text-gray-400 dark:text-gray-500 text-sm">No hay bitácoras para los filtros seleccionados.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {porCurso.map((grupoCurso) => {
                const cursoId   = grupoCurso.curso?.id;
                const isOpen    = !closedCursos.has(cursoId);
                const pctCalif  = grupoCurso.stats.total > 0
                    ? Math.round((grupoCurso.stats.calificadas / grupoCurso.stats.total) * 100)
                    : 0;

                return (
                    <div key={cursoId}
                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">

                        {/* Header acordeón */}
                        <button
                            type="button"
                            onClick={() => toggle(cursoId)}
                            className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1.5">
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                        📚 {grupoCurso.curso?.nombre ?? 'Curso'}
                                        {grupoCurso.curso?.paralelo ? ` — Paralelo ${grupoCurso.curso.paralelo}` : ''}
                                    </p>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {grupoCurso.stats.total} entregas
                                    </span>
                                    {grupoCurso.stats.promedio > 0 && (
                                        <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                                            Prom: {grupoCurso.stats.promedio}/10
                                        </span>
                                    )}
                                </div>
                                <BarraProgreso pct={pctCalif} />
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                    {grupoCurso.stats.calificadas} de {grupoCurso.stats.total} calificadas
                                </p>
                            </div>
                            {isOpen
                                ? <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
                                : <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />}
                        </button>

                        {/* Contenido: agrupar por numero_global */}
                        {isOpen && (
                            <div className="border-t border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                                {Object.entries(grupoCurso.bitacoras || {})
                                    .sort(([a], [b]) => parseInt(a) - parseInt(b))
                                    .map(([num, grupo]) => (
                                        <TablaConfig
                                            key={num}
                                            numeroGlobal={num}
                                            bitacorasGrupo={grupo}
                                            matriculados={grupoCurso.matriculados}
                                            onVer={onVerDetalle}
                                        />
                                    ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
