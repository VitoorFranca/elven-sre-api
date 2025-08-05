#!/bin/bash

# 1. Instalar Certbot na EC2
sudo apt update
sudo apt install certbot

# 2. Gerar certificado
sudo certbot certonly --standalone -d api.elven-sre.store

# 3. Criar diretório para certificados
mkdir -p ssl

# 4. Copiar certificados para o diretório do projeto
sudo cp -r /etc/letsencrypt/live/api.elven-sre.store ssl/
sudo cp -r /etc/letsencrypt/archive/api.elven-sre.store ssl/
sudo chown -R $USER:$USER ssl/