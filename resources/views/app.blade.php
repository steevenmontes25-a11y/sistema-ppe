<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="csrf-token" content="{{ csrf_token() }}" />

    <title inertia>{{ config('app.name', 'Sistema PPE') }}</title>

    <!-- Fuentes -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

    {{-- Aplica el tema ANTES de que React renderice para evitar flash --}}
    <script>
        try {
            var t = localStorage.getItem('ppe-theme');
            if (t === 'dark') document.documentElement.classList.add('dark');
        } catch (e) {}
    </script>

    <!-- Ziggy para rutas nombradas en React -->
    @routes

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @inertiaHead
</head>
<body class="font-sans antialiased bg-gray-50 dark:bg-gray-900">
    @inertia
</body>
</html>
