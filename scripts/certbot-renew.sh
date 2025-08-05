#!/bin/bash
# renovar-ssl.sh

# Para agendar a renovação automática, adicione a seguinte linha ao seu crontab (crontab -e):
# 0 3 1 */2 * /c/Users/Vitor/Desktop/Projects/elven-sre/api/scripts/certbot-renew.sh >> /c/Users/Vitor/Desktop/Projects/elven-sre/api/scripts/certbot-renew.log 2>&1

# Parar Nginx
docker compose stop nginx

# Renovar certificado
sudo certbot renew

# Copiar novos certificados
sudo cp -r /etc/letsencrypt/live/api.elven-sre.store ssl/
sudo cp -r /etc/letsencrypt/archive/api.elven-sre.store ssl/
sudo chown -R $USER:$USER ssl/

# Reiniciar Nginx
docker compose start nginx
