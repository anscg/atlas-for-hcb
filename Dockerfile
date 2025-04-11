FROM node:18 AS base
WORKDIR /app

FROM base AS deps
WORKDIR /app
COPY package.json ./
RUN npm install --legacy-peer-deps --omit=dev

FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma
COPY . .
RUN npm install --legacy-peer-deps --include=dev
RUN npx prisma generate
RUN npm prune --production
RUN npm run build

FROM node:18-slim AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]

