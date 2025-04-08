FROM node:18 as build

WORKDIR /app

# Copy package file
COPY package.json ./

# Install dependencies using npm without requiring package-lock.json
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

FROM node:18-slim as production

WORKDIR /app

ENV NODE_ENV=production

# Copy the build from the previous stage
COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

# Expose the port that the app will run on
EXPOSE 3000

# Start the app
CMD ["npm", "run", "start"]