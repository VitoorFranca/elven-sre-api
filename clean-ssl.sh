#!/bin/bash

echo "Parando containers existentes..."
docker-compose down

# Remover volumes antigos do nginx (se existirem)
echo "Limpando volumes antigos..."
docker volume rm elven-sre_nginx_certs elven-sre_nginx_vhost elven-sre_nginx_html elven-sre_acme 2>/dev/null || true

# Subir os containers
echo "Iniciando containers com SSL automático..."
docker-compose up -d

# Aguardar um pouco para os containers iniciarem
echo "Aguardando containers iniciarem..."
sleep 10

# Verificar status dos containers
echo "Status dos containers:"
docker-compose ps