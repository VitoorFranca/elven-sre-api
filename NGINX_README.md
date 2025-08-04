# Configuração do Nginx com Docker

Este projeto está configurado para usar o Nginx como proxy reverso para a aplicação Node.js.

## 📋 Configuração Atual

### Arquivos Criados/Modificados:

1. **`nginx.conf`** - Configuração do Nginx
2. **`docker-compose.yml`** - Atualizado para incluir o serviço do Nginx

### Estrutura dos Serviços:

- **Nginx** (porta 80) - Proxy reverso
- **API Node.js** (porta 3000) - Aplicação principal
- **MySQL** (porta 3306) - Banco de dados
- **Jaeger** (porta 8081) - Observabilidade
- **OTEL Collector** - Coleta de telemetria

## 🚀 Como Usar

### 1. Subir todos os serviços:
```bash
docker-compose up -d
```

### 2. Verificar se os containers estão rodando:
```bash
docker-compose ps
```

### 3. Acessar a aplicação:
- **Via Nginx**: `http://localhost` ou `http://seu-ip-ec2`
- **Direto na API**: `http://localhost:3000` (se descomentado no docker-compose)

### 4. Verificar logs do Nginx:
```bash
docker-compose logs nginx
```

## 🔧 Configurações do Nginx

### Funcionalidades Implementadas:

✅ **Proxy Reverso** - Redireciona requisições para a API
✅ **Headers de Segurança** - Proteção contra ataques comuns
✅ **Compressão Gzip** - Reduz tamanho das respostas
✅ **Logs Detalhados** - Monitoramento de acesso
✅ **Timeouts Configurados** - Evita travamentos
✅ **Health Check** - Endpoint específico para monitoramento

### Endpoints Disponíveis:

- `/` - Aplicação principal
- `/health` - Health check da API
- `/static/` - Arquivos estáticos (se necessário)

## 🌐 Configuração para EC2

### 1. Liberar Porta 80 no Security Group:
- Tipo: HTTP
- Porta: 80
- Origem: 0.0.0.0/0 (ou IPs específicos)

### 2. Acessar via IP Público:
```
http://SEU_IP_PUBLICO_EC2
```

## 🔍 Troubleshooting

### Problemas Comuns:

1. **Erro 502 Bad Gateway**:
   - Verificar se a API está rodando: `docker-compose logs elven-sre-api`
   - Verificar conectividade entre containers

2. **Nginx não inicia**:
   - Verificar sintaxe do nginx.conf: `docker-compose logs nginx`
   - Verificar se o arquivo nginx.conf existe

3. **Acesso negado**:
   - Verificar Security Group da EC2
   - Verificar se a porta 80 está liberada

### Comandos Úteis:

```bash
# Reiniciar apenas o Nginx
docker-compose restart nginx

# Ver logs em tempo real
docker-compose logs -f nginx

# Testar configuração do Nginx
docker-compose exec nginx nginx -t

# Acessar container do Nginx
docker-compose exec nginx bash
```

## 📊 Monitoramento

### Logs Disponíveis:
- **Access Log**: `/var/log/nginx/access.log`
- **Error Log**: `/var/log/nginx/error.log`

### Métricas Importantes:
- Requisições por segundo
- Tempo de resposta
- Códigos de status HTTP
- Erros 4xx/5xx

## 🔒 Segurança

### Headers Implementados:
- `X-Frame-Options`: Previne clickjacking
- `X-XSS-Protection`: Proteção XSS
- `X-Content-Type-Options`: Previne MIME sniffing
- `Referrer-Policy`: Controle de referrer
- `Content-Security-Policy`: Política de segurança de conteúdo

## 📝 Próximos Passos

1. **SSL/HTTPS**: Configurar certificados SSL
2. **Rate Limiting**: Implementar limitação de requisições
3. **Cache**: Configurar cache para arquivos estáticos
4. **Load Balancer**: Configurar múltiplas instâncias
5. **Monitoring**: Integrar com ferramentas de monitoramento 