# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files for workspace setup
COPY package.json package-lock.json ./

# Copy workspace package.json files
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source files
COPY tsconfig.base.json ./
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Build backend and frontend
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/

# Install production dependencies only
RUN npm ci --workspace=backend --omit=dev

# Copy built backend
COPY --from=builder /app/backend/dist ./backend/dist

# Copy built frontend to backend's public directory
COPY --from=builder /app/frontend/dist ./backend/public

# Create data directory
RUN mkdir -p /data

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/data

EXPOSE 3000

# Run the backend server
CMD ["node", "backend/dist/index.js"]
