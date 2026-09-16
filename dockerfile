FROM node:20-alpine

WORKDIR /app

# Ferramentas para compilação nativa de drivers como better-sqlite3 e utilitários
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++ \
    sqlite \
    bash \
    curl

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Se o projeto já tiver os scripts configurados, executa; caso contrário, aguarda comandos da equipe
CMD ["sh", "-c", "if [ -f package.json ] && grep -q '\"dev\"' package.json; then npm install && npm run dev; else echo '[Nextron] Aguardando inicialização do projeto...'; sleep infinity; fi"]
