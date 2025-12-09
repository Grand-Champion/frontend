# Gebruikt Vite's preview om de productie build te hosten op port 4173

FROM node:20-alpine AS builder
WORKDIR /app

# installeer dependencies (kopieert package manifest en lockfile indien aanwezig)
COPY package.json package-lock.json* ./
RUN npm ci --silent

# Kopieer de rest van de app en bouw deze
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# kopieer de gebouwde app en node_modules van de builder
COPY --from=builder /app /app
EXPOSE 4173

# Start de vite preview server
CMD ["npm","run","preview","--","--host","0.0.0.0","--port","4173"]
