FROM php:8.1-fpm

WORKDIR /var/www/html

RUN apt-get update && apt-get install -y libpq-dev zip unzip git curl \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && docker-php-ext-install pdo pdo_pgsql pgsql

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

COPY composer.json composer.lock ./

COPY . .

RUN composer install --optimize-autoloader --no-dev

RUN composer run-script post-autoload-dump

RUN php artisan config:cache
RUN php artisan route:cache
RUN php artisan key:generate

ENV APP_ENV=production
ENV APP_DEBUG=false
ENV TZ=America/Sao_Paulo

# Permissions
RUN chown -R www-data:www-data /var/www/html \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 755 /var/www/html \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 9000

CMD ["php-fpm"]


