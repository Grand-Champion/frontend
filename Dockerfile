# Multi-stage Dockerfile for building and serving the SvelteKit app
# Uses Vite's preview to serve the production build on port 4173

FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies (copy package manifest and lockfile if present)
COPY package.json package-lock.json* ./
RUN npm ci --silent

# Copy source and build
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy built app and node_modules from builder
COPY --from=builder /app /app

EXPOSE 4173

# Start the Vite preview server and bind to all interfaces
CMD ["npm","run","preview","--","--host","0.0.0.0","--port","4173"]
