# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.15.0

################################################################################
# Base image
FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /usr/src/app

################################################################################
# Dependencies
FROM base AS deps

# Install only production dependencies for runtime layer
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

################################################################################
# Build stage
FROM base AS build

# Install all dependencies (including dev) for building
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

COPY . .

# Increase memory limit for Next.js build
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Generate Prisma client (no DB connection required)
RUN npx prisma generate

# Build Next.js for production
RUN npm run build

################################################################################
# Final lightweight runtime image
FROM base AS final

ENV NODE_ENV=production

# Copy only required files
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/.next ./.next
COPY --from=build /usr/src/app/public ./public
COPY --from=build /usr/src/app/package.json ./package.json
COPY --from=build /usr/src/app/prisma ./prisma

# Use non-root user
USER node

EXPOSE 3000

# Start the Next.js production server
CMD ["npm", "run", "start"]
