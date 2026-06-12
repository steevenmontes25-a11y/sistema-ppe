# ── Etapa 1: Build de assets React/Vite ──────────────────────────────────────
FROM node:18-slim AS frontend

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY resources/ ./resources/
COPY vite.config.js tailwind.config.js postcss.config.js ./
COPY public/ ./public/

RUN npm run build

# ── Etapa 2: PHP runtime ──────────────────────────────────────────────────────
FROM php:8.3-cli-bookworm AS runtime

# Dependencias del sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    zip \
    unzip \
    libzip-dev \
    libxml2-dev \
    libonig-dev \
    libpng-dev \
    && rm -rf /var/lib/apt/lists/*

# Extensiones PHP (sin intl ni gd — no requeridas)
RUN docker-php-ext-install -j$(nproc) \
    pdo \
    pdo_mysql \
    mbstring \
    xml \
    zip \
    bcmath \
    opcache \
    tokenizer \
    fileinfo

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Dependencias PHP
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

# Código fuente
COPY . .

# Assets compilados desde etapa frontend
COPY --from=frontend /app/public/build ./public/build

# Post-install
RUN composer run-script post-autoload-dump 2>/dev/null || true

# Permisos
RUN chmod -R 775 storage bootstrap/cache

EXPOSE 8000

CMD ["bash", "start.sh"]
