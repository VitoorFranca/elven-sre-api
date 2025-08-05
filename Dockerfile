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
RUN yarn install --frozen-lockfile && yarn cache clean

# Copiar arquivo de configuração do TypeScript
COPY tsconfig.json ./

# Copiar código fonte
COPY src/ ./src/

# Compilar TypeScript
RUN yarn build

# Stage de produção
FROM node:18-alpine AS production

# Instalar dependências de segurança
RUN apk add --no-cache dumb-init

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos com propriedade correta
COPY --chown=nodejs:nodejs package*.json ./
COPY --chown=nodejs:nodejs yarn.lock ./

# Instalar apenas dependências de produção
RUN yarn install --frozen-lockfile --production && yarn cache clean

# Copiar código compilado do stage anterior
COPY --chown=nodejs:nodejs --from=builder /app/dist ./dist

# Copiar arquivos necessários da pasta src
COPY --chown=nodejs:nodejs --from=builder /app/src/config ./src/config
COPY --chown=nodejs:nodejs --from=builder /app/src/database ./src/database
COPY --chown=nodejs:nodejs --from=builder /app/src/domain ./src/domain
COPY --chown=nodejs:nodejs --from=builder /app/src/handler ./src/handler
COPY --chown=nodejs:nodejs --from=builder /app/src/middleware ./src/middleware
COPY --chown=nodejs:nodejs --from=builder /app/src/repository ./src/repository
COPY --chown=nodejs:nodejs --from=builder /app/src/routes ./src/routes
COPY --chown=nodejs:nodejs --from=builder /app/src/service ./src/service
COPY --chown=nodejs:nodejs --from=builder /app/src/usecase ./src/usecase
COPY --chown=nodejs:nodejs --from=builder /app/src/utils ./src/utils

# Mudar para usuário não-root
USER nodejs

# Expor porta
EXPOSE 3000

# Configurar variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Usar dumb-init para melhor gerenciamento de processos
ENTRYPOINT ["dumb-init", "--"]

# Comando para iniciar a aplicação
CMD ["node", "dist/index.js"]