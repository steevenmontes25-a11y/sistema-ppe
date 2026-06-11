FROM php:8.3-cli-alpine

# Dependencias del sistema
RUN apk add --no-cache \
    nodejs \
    npm \
    git \
    curl \
    bash \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    oniguruma-dev \
    libxml2-dev \
    icu-dev \
    freetype-dev \
    libjpeg-turbo-dev \
    libwebp-dev \
    linux-headers \
    $PHPIZE_DEPS

# Extensiones PHP
RUN docker-php-ext-configure gd \
        --with-freetype \
        --with-jpeg \
        --with-webp \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_mysql \
        mbstring \
        xml \
        curl \
        zip \
        gd \
        bcmath \
        intl \
        opcache \
        tokenizer \
        fileinfo

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Instalar dependencias PHP primero (cache layer)
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

# Instalar dependencias Node (cache layer)
COPY package.json package-lock.json ./
RUN npm ci

# Copiar código fuente
COPY . .

# Ejecutar post-install scripts de composer
RUN composer run-script post-autoload-dump 2>/dev/null || true

# Compilar assets React/Vite
RUN npm run build

# Permisos de storage
RUN chmod -R 775 storage bootstrap/cache

EXPOSE 8000

CMD ["bash", "start.sh"]
