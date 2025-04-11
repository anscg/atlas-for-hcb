# ---- Base Node ----
    FROM node:18 AS base
    WORKDIR /app
    
    # ---- Dependencies ----
    # Install only production dependencies first
    FROM base AS deps
    WORKDIR /app
    COPY package.json ./
    # Use --omit=dev to install only production dependencies
    RUN npm install --legacy-peer-deps --omit=dev
    
    # ---- Build ----
    # Build the application including Prisma Client generation
    FROM base AS build
    WORKDIR /app
    
    # Copy production dependencies from the 'deps' stage
    COPY --from=deps /app/node_modules ./node_modules
    # Copy prisma schema first
    COPY prisma ./prisma
    # Copy the rest of the application code
    COPY . .
    
    # Temporarily install ALL dependencies (including dev) for prisma generate and build steps
    RUN npm install --legacy-peer-deps --include=dev
    # Generate Prisma Client (needs dev dependency 'prisma')
    RUN npx prisma generate
    # Build the Remix app (needs dev dependency '@remix-run/dev')
    RUN npm run build
    # Prune dev dependencies AFTER build and generate are complete
    # Use --omit=dev as recommended by npm, keep --legacy-peer-deps
    RUN npm prune --omit=dev --legacy-peer-deps
    
    # ---- Production ----
    # Final, minimal production image
    FROM node:18-slim AS production
    WORKDIR /app
    
    ENV NODE_ENV=production
    
    # Copy necessary artifacts from the build stage
    # node_modules now only contains production dependencies
    COPY --from=build /app/node_modules ./node_modules
    COPY --from=build /app/build ./build
    COPY --from=build /app/package.json ./package.json
    # Copy the Prisma schema needed for migrations at runtime
    COPY --from=build /app/prisma ./prisma
    
    EXPOSE 3000
    
    # Run database migrations and start the application
    CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
    