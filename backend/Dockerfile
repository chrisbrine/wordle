FROM bref/php-82-fpm:2
 
# Copy the source code in the image
COPY . /var/task

# Ensure the directory exists
RUN mkdir -p /opt/bref/etc/php/conf.d

 # Enable PHP error reporting
RUN echo "display_errors=On" >> /opt/bref/etc/php/conf.d/custom.ini \
    && echo "display_startup_errors=On" >> /opt/bref/etc/php/conf.d/custom.ini \
    && echo "error_reporting=E_ALL" >> /opt/bref/etc/php/conf.d/custom.ini
RUN chmod 644 /opt/bref/etc/php/conf.d/custom.ini

ENV PHP_INI_SCAN_DIR=/opt/bref/etc/php/conf.d

# Configure the handler file (the entrypoint that receives all HTTP requests)
CMD ["public/index.php"]