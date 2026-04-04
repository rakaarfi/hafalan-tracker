# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY frontend/package.json frontend/package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY frontend/ ./

# Build
RUN npm run build

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY frontend/package.json frontend/package-lock.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy build from builder
COPY --from=builder /app/dist ./dist

EXPOSE 5173

CMD ["npm", "run", "preview"]
