# Multi-stage build para otimização
FROM node:18-alpine AS builder

# Instalar dependências do sistema necessárias
RUN apk add --no-cache python3 make g++

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências primeiro (melhor cache)
COPY package*.json ./
COPY yarn.lock ./

# Instalar todas as dependências (incluindo devDependencies para build)
RUN yarn install --frozen-lockfile

# Copiar arquivo de configuração do TypeScript
COPY tsconfig.json ./

# Copiar código fonte
COPY src/ ./src/

# Compilar TypeScript
RUN yarn build

# Remover devDependencies após build
RUN yarn install --frozen-lockfile --production && yarn cache clean

# Stage de produção
FROM node:18-alpine AS production

# Instalar dependências de segurança
RUN apk add --no-cache dumb-init

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e yarn.lock
COPY package*.json ./
COPY yarn.lock ./

# Instalar apenas dependências de produção
RUN yarn install --frozen-lockfile --production && yarn cache clean

# Copiar código compilado do stage anterior
COPY --from=builder /app/dist ./dist

# Copiar arquivos necessários
COPY --from=builder /app/src/config ./src/config
COPY --from=builder /app/src/database ./src/database
COPY --from=builder /app/src/domain ./src/domain
COPY --from=builder /app/src/handler ./src/handler
COPY --from=builder /app/src/middleware ./src/middleware
COPY --from=builder /app/src/repository ./src/repository
COPY --from=builder /app/src/routes ./src/routes
COPY --from=builder /app/src/service ./src/service
COPY --from=builder /app/src/usecase ./src/usecase
COPY --from=builder /app/src/utils ./src/utils

# Alterar propriedade dos arquivos para o usuário nodejs
RUN chown -R nodejs:nodejs /app

# Mudar para usuário não-root
USER nodejs

# Expor porta
EXPOSE 3000

# Configurar variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Usar dumb-init para melhor gerenciamento de processos
ENTRYPOINT ["dumb-init", "--"]

# Comando para iniciar a aplicação
CMD ["node", "dist/index.js"] 