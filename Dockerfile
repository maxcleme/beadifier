FROM nginx

## CONFIG NGINX
COPY docker_content/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker_content/nginx/beadifier.conf /etc/nginx/sites-enabled/beadifier.conf

## COPY FRONT-RESOURCES
COPY dist /usr/share/nginx/html