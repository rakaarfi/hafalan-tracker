# Build stage
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy package files
COPY frontend/package.json frontend/bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY frontend/ ./

# Build
RUN bun run build

# Runtime stage
FROM oven/bun:1-alpine

WORKDIR /app

# Copy package files
COPY frontend/package.json frontend/bun.lockb ./

# Install production dependencies only
RUN bun install --frozen-lockfile --production

# Copy build from builder
COPY --from=builder /app/dist ./dist

EXPOSE 5173

CMD ["bun", "run", "preview"]
