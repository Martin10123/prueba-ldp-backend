FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN echo "DATABASE_URL=postgresql://dummy:dummy@dummy/dummy\nJWT_SECRET=dummy\nPORT=3000" > .env && \
    npx prisma generate && \
    rm .env

RUN npx tsc -p tsconfig.json

EXPOSE 8080

CMD ["sh", "-c", "npx prisma migrate deploy && npx ts-node prisma/seed.ts && node dist/index.js"]