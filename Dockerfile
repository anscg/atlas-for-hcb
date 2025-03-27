FROM oven/bun:1 as build

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies using Bun
RUN bun install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build the application
RUN bun run build

FROM oven/bun:1-slim as production

WORKDIR /app

ENV NODE_ENV=production

# Copy the build from the previous stage
COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

# Expose the port that the app will run on
EXPOSE 3000

# Start the app
CMD ["bun", "run", "start"]