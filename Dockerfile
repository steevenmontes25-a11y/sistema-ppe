FROM php:8.3-cli-bookworm

# Node.js 18 + dependencias del sistema
RUN apt-get update && apt-get install -y \
    curl \
    git \
    zip \
    unzip \
    libzip-dev \
    libxml2-dev \
    libicu-dev \
    libonig-dev \
    libpng-dev \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Extensiones PHP (sin GD — no se usa en el proyecto)
RUN docker-php-ext-install -j$(nproc) \
    pdo \
    pdo_mysql \
    mbstring \
    xml \
    zip \
    bcmath \
    intl \
    opcache \
    tokenizer \
    fileinfo

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Dependencias PHP (capa cacheada)
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

# Dependencias Node (capa cacheada)
COPY package.json package-lock.json ./
RUN npm ci

# Código fuente
COPY . .

# Post-install scripts
RUN composer run-script post-autoload-dump 2>/dev/null || true

# Build React/Vite
RUN npm run build

# Permisos
RUN chmod -R 775 storage bootstrap/cache

EXPOSE 8000

CMD ["bash", "start.sh"]
