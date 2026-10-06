# ── Stage 1: Build Expo Web Bundle ───────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code and configuration
COPY . .

# Build argument to inject production API URL
ARG EXPO_PUBLIC_API_URL=http://localhost:5000/api/v1
ENV EXPO_PUBLIC_API_URL=${EXPO_PUBLIC_API_URL}

# Build static web export
RUN npm run build:web

# ── Stage 2: Production Nginx Server ─────────────────────────
FROM nginx:alpine

# Copy static build from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy Nginx SPA config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
