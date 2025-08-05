#!/bin/bash
# renovar-ssl.sh

# Parar Nginx
docker-compose stop nginx

# Renovar certificado
sudo certbot renew

# Copiar novos certificados
sudo cp -r /etc/letsencrypt/live/api.elven-sre.store ssl/
sudo cp -r /etc/letsencrypt/archive/api.elven-sre.store ssl/
sudo chown -R $USER:$USER ssl/

# Reiniciar Nginx
docker-compose start nginx
