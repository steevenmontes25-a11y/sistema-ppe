#!/bin/bash
set -e

echo "========================================="
echo "  Sistema PPE — Iniciando deploy"
echo "========================================="

# Crear directorios de storage necesarios
echo "[1/7] Preparando directorios de storage..."
mkdir -p storage/app/public/bitacoras
mkdir -p storage/app/public/fotos-perfil
mkdir -p storage/app/public/directorio
mkdir -p storage/app/private
mkdir -p storage/framework/cache/data
mkdir -p storage/framework/sessions
mkdir -p storage/framework/views
mkdir -p storage/logs
chmod -R 775 storage bootstrap/cache

# Crear enlace de storage
echo "[2/7] Creando storage link..."
php artisan storage:link --force 2>/dev/null || true

# Generar APP_KEY si no está definida
if [ -z "$APP_KEY" ]; then
    echo "[3/7] Generando APP_KEY..."
    php artisan key:generate --force
else
    echo "[3/7] APP_KEY ya configurada."
fi

# Ejecutar migraciones
echo "[4/7] Ejecutando migraciones..."
php artisan migrate --force

# Ejecutar seeders solo si la BD está vacía
echo "[5/7] Verificando datos iniciales..."
USER_COUNT=$(php artisan tinker --execute="echo App\Models\User::count();" 2>/dev/null | tail -1 || echo "0")

if [ "$USER_COUNT" = "0" ] || [ -z "$USER_COUNT" ]; then
    echo "  → BD vacía — ejecutando seeders..."
    php artisan db:seed --force
else
    echo "  → BD ya tiene ${USER_COUNT} usuarios — omitiendo seeders."
fi

# Limpiar cachés anteriores y re-cachear
echo "[6/7] Optimizando..."
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "[7/7] Deploy completado."
echo "========================================="

# Iniciar servidor
exec php artisan serve --host=0.0.0.0 --port="${PORT:-8000}"
