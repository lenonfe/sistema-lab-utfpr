# 1. Imagem base com Node e suporte para o Prisma (importante para seu projeto)
FROM node:20-slim
RUN apt-get update && apt-get install -y openssl

# 2. Pasta onde o projeto vai morar dentro do Docker
WORKDIR /app

# 3. Copia arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# 4. Instala dependências e gera o Prisma Client
RUN npm install
RUN npx prisma generate

# 5. Copia o resto dos arquivos
COPY . .

# 6. Porta do servidor
EXPOSE 3000

# 7. Comando de inicialização
CMD ["npm", "start"]