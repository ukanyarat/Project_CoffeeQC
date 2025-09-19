# Stage 1: Prune the monorepo to get only the necessary files
FROM node:20-alpine AS pruner
WORKDIR /app

# Copy root package manifests and turbo config
COPY package.json package-lock.json turbo.json ./

# Copy all workspace package manifests
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json

# Use npm to install dependencies for pruning
RUN npm install

# Prune the repo to get a minimal setup for building the apps
# We scope it to the backend and frontend applications
RUN npx turbo prune --scope=backend --scope=frontend --docker

# Stage 2: Build the applications
FROM node:20-alpine AS builder
WORKDIR /app

# Copy the pruned dependency manifests
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json

# Install production dependencies
RUN npm install

# Copy the pruned source code
COPY --from=pruner /app/out/full/ .

# Run the build for both frontend and backend
RUN npx turbo run build --filter=frontend --filter=backend

# Stage 3: Create the final, minimal production image
FROM node:20-alpine AS runner
WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy the pruned and installed production node_modules from the builder
COPY --from=builder /app/out/full/package.json .
COPY --from=builder /app/out/package-lock.json .
COPY --from=builder /app/out/json/ ./
RUN npm install

# Copy the built backend application
# It's important that the backend's package.json is also copied
COPY --from=builder /app/out/full/backend ./backend

# Copy the built frontend static assets
COPY --from=builder /app/out/full/frontend/dist ./frontend/dist

# Expose the port the server will run on.
# You might need to change this depending on your backend configuration.
EXPOSE 8080

# Command to start the backend server.
# This assumes your backend entrypoint is backend/index.js.
CMD ["node", "backend/index.js"]
