# ── Etapa 1: Build de assets React/Vite ──────────────────────────────────────
FROM node:22-slim AS frontend

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY resources/ ./resources/
COPY vite.config.js tailwind.config.js postcss.config.js ./
COPY public/ ./public/

RUN npm run build

# ── Etapa 2: PHP runtime ──────────────────────────────────────────────────────
FROM php:8.3-cli-bookworm AS runtime

# Herramienta confiable para instalar extensiones PHP sin compilar desde cero
RUN curl -sSLf \
    "https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions" \
    -o /usr/local/bin/install-php-extensions \
    && chmod +x /usr/local/bin/install-php-extensions

# Extensiones PHP con binarios pre-compilados
RUN install-php-extensions \
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
