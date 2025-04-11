# ---- Base Node ----
    FROM node:18 AS base
    WORKDIR /app
    
    # ---- Dependencies ----
    # Install ALL dependencies needed for build and runtime initially
    # We won't prune later, so install everything needed now.
    FROM base AS deps
    WORKDIR /app
    COPY package.json ./
    # Install everything, including dev, using legacy-peer-deps
    RUN npm install --legacy-peer-deps
    
    # ---- Build ----
    # Build the application including Prisma Client generation
    FROM base AS build
    WORKDIR /app
    
    # Copy ALL dependencies from the 'deps' stage
    COPY --from=deps /app/node_modules ./node_modules
    # Copy prisma schema first
    COPY prisma ./prisma
    # Copy the rest of the application code
    COPY . .
    
    # Generate Prisma Client (needs dev dependency 'prisma')
    # Dependencies are already installed
    RUN npx prisma generate
    # Build the Remix app (needs dev dependency '@remix-run/dev')
    RUN npm run build
    # --- REMOVED npm prune ---
    # We are intentionally NOT pruning here to avoid the ERESOLVE error
    # This means devDependencies WILL be included in the final image.
    
    # ---- Production ----
    # Final production image (will include devDependencies)
    FROM node:18-slim AS production
    WORKDIR /app
    
    ENV NODE_ENV=production
    
    # Copy necessary artifacts from the build stage
    # node_modules now contains BOTH production and dev dependencies
    COPY --from=build /app/node_modules ./node_modules
    COPY --from=build /app/build ./build
    COPY --from=build /app/package.json ./package.json
    # Copy the Prisma schema needed for migrations at runtime
    COPY --from=build /app/prisma ./prisma
    
    EXPOSE 3000
    
    # Run database migrations and start the application
    # npx command will find prisma CLI in the copied node_modules
    CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
    