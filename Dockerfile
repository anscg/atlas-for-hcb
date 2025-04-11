FROM node:18 as build

WORKDIR /app

# Copy package file
COPY package.json ./

# Install dependencies using npm without requiring package-lock.json
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

FROM node:18-slim as production

WORKDIR /app

ENV NODE_ENV=production

# Copy the build from the previous stage
COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma

# Generate Prisma client again in the production image
RUN npm install --production=false --legacy-peer-deps
RUN npx prisma generate
RUN npm prune --production

# Expose the port that the app will run on
EXPOSE 3000

# Start the app
CMD ["npm", "run", "start"]