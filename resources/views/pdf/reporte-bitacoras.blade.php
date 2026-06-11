<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; font-size: 11px; color: #1F2937; margin: 0; padding: 0; }
        .header { background: #4A1B8C; color: white; padding: 15px 20px; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 18px; font-weight: bold; }
        .header p  { margin: 5px 0 0; font-size: 11px; opacity: 0.85; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10px; }
        th { background: #6B2FBF; color: white; padding: 6px 8px; text-align: left; font-size: 9px; text-transform: uppercase; letter-spacing: 0.05em; }
        td { padding: 5px 8px; border-bottom: 1px solid #E5E7EB; vertical-align: top; }
        tr:nth-child(even) td { background: #F9FAFB; }
        .curso-header {
            background: #EDE9FE; color: #4A1B8C; font-weight: bold;
            padding: 8px 12px; margin: 20px 0 4px;
            font-size: 13px; border-left: 4px solid #7C3AED;
        }
        .badge { display: inline-block; padding: 2px 7px; border-radius: 20px; font-size: 9px; font-weight: bold; }
        .badge-verde   { background: #D1FAE5; color: #065F46; }
        .badge-rojo    { background: #FEE2E2; color: #991B1B; }
        .badge-azul    { background: #DBEAFE; color: #1E40AF; }
        .badge-amarillo{ background: #FEF9C3; color: #92400E; }
        .badge-gris    { background: #F3F4F6; color: #374151; }
        .resumen {
            display: flex; gap: 12px; margin-bottom: 20px;
            background: #F5F3FF; border: 1px solid #DDD6FE;
            padding: 10px 14px; border-radius: 6px;
        }
        .resumen-item { text-align: center; flex: 1; }
        .resumen-item .num { font-size: 20px; font-weight: bold; color: #4A1B8C; }
        .resumen-item .lbl { font-size: 9px; color: #6B7280; text-transform: uppercase; }
        .footer { text-align: center; color: #9CA3AF; font-size: 9px; margin-top: 30px; border-top: 1px solid #E5E7EB; padding-top: 10px; }
        .no-data { text-align: center; color: #9CA3AF; font-style: italic; padding: 14px; }
    </style>
</head>
<body>

<div class="header">
    <h1>📋 Sistema PPE — Reporte de Bitácoras</h1>
    <p>Período: {{ $periodoActivo?->nombre ?? 'Sin período activo' }} &nbsp;|&nbsp; Generado: {{ $generadoEn }}</p>
</div>

@php
    $totalEntregas  = 0;
    $totalCalif     = 0;
    $sumaNotas      = 0;
    $contNotas      = 0;
    foreach ($cursos as $curso) {
        foreach ($curso->bitacoras as $b) {
            $totalEntregas++;
            if ($b->calificacion) {
                $totalCalif++;
                $sumaNotas += $b->calificacion->nota;
                $contNotas++;
            }
        }
    }
    $promedio = $contNotas > 0 ? round($sumaNotas / $contNotas, 2) : 0;
@endphp

<div class="resumen">
    <div class="resumen-item">
        <div class="num">{{ $totalEntregas }}</div>
        <div class="lbl">Total entregas</div>
    </div>
    <div class="resumen-item">
        <div class="num">{{ $totalCalif }}</div>
        <div class="lbl">Calificadas</div>
    </div>
    <div class="resumen-item">
        <div class="num">{{ $totalEntregas - $totalCalif }}</div>
        <div class="lbl">Pendientes</div>
    </div>
    <div class="resumen-item">
        <div class="num">{{ $promedio }}/10</div>
        <div class="lbl">Promedio</div>
    </div>
</div>

@forelse($cursos as $curso)
    @if($curso->bitacoras->count() > 0)
    <div class="curso-header">
        📚 {{ $curso->nombre }}{{ $curso->paralelo ? ' — Paralelo ' . $curso->paralelo : '' }}
        &nbsp;&nbsp;
        <span style="font-size:11px;font-weight:normal;color:#6B21A8;">
            {{ $curso->bitacoras->count() }} entrega(s)
        </span>
    </div>

    <table>
        <thead>
            <tr>
                <th>Bitácora N°</th>
                <th>Estudiante</th>
                <th>Matrícula</th>
                <th>Estado entrega</th>
                <th>Fecha entrega</th>
                <th>Nota</th>
                <th>Estado calif.</th>
                <th>Docente calificador</th>
            </tr>
        </thead>
        <tbody>
            @forelse($curso->bitacoras->sortBy('config.numero_global') as $b)
            <tr>
                <td>
                    <strong>Bitácora {{ $b->config?->numero_global ?? '—' }}</strong>
                    @if($b->config?->nombre)
                        <br><span style="color:#6B7280;font-size:9px;">{{ $b->config->nombre }}</span>
                    @endif
                </td>
                <td>{{ $b->estudiante?->nombre_completo ?? '—' }}</td>
                <td>{{ $b->estudiante?->numero_matricula ?? '—' }}</td>
                <td>
                    @php
                        $estadoBadge = match($b->estado) {
                            'entregada' => 'badge-azul',
                            'revisada'  => 'badge-verde',
                            'devuelta'  => 'badge-amarillo',
                            default     => 'badge-gris',
                        };
                    @endphp
                    <span class="badge {{ $estadoBadge }}">{{ ucfirst($b->estado) }}</span>
                </td>
                <td>{{ $b->fecha_entrega?->format('d/m/Y') ?? '—' }}</td>
                <td>
                    @if($b->calificacion)
                        @php
                            $notaBadge = (float)$b->calificacion->nota >= 7 ? 'badge-verde' : 'badge-rojo';
                        @endphp
                        <span class="badge {{ $notaBadge }}">
                            {{ number_format($b->calificacion->nota, 2) }}/10
                        </span>
                    @else
                        <span style="color:#9CA3AF;">—</span>
                    @endif
                </td>
                <td>
                    @if($b->calificacion)
                        <span class="badge badge-verde">Calificada</span>
                    @else
                        <span class="badge badge-rojo">Pendiente</span>
                    @endif
                </td>
                <td>{{ $b->calificacion?->docente?->nombre_completo ?? '—' }}</td>
            </tr>
            @empty
            <tr><td colspan="8" class="no-data">Sin entregas registradas</td></tr>
            @endforelse
        </tbody>
    </table>
    @endif
@empty
    <p class="no-data">No hay datos de bitácoras para este período.</p>
@endforelse

<div class="footer">
    Sistema PPE — Participación Estudiantil &nbsp;|&nbsp; Reporte generado automáticamente el {{ $generadoEn }}
</div>

</body>
</html>
