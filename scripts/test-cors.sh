#!/bin/bash

echo "🧪 Testando configuração de CORS..."

# URL base da API
API_URL=${1:-"http://localhost:3000"}

echo "📍 URL da API: $API_URL"

# Teste 1: Health check
echo -e "\n1️⃣ Testando health check..."
curl -X GET "$API_URL/api/health" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5173" \
  -v

echo -e "\n\n2️⃣ Testando preflight request..."
curl -X OPTIONS "$API_URL/api/health" \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -v

echo -e "\n\n3️⃣ Testando requisição com Authorization header..."
curl -X GET "$API_URL/api/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -H "Origin: http://localhost:5173" \
  -v

echo -e "\n✅ Testes de CORS concluídos!" 