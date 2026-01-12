FROM node:18-bullseye-slim


WORKDIR /app

# 1. Copy package files
COPY package*.json ./

# 2. Install ALL dependencies (dev deps needed for build + prisma)
RUN npm install

# 3. Copy Prisma schema
COPY prisma ./prisma/

# 4. Generate Prisma client (needs dev deps + schema)
RUN npx prisma generate

# 5. Copy source code
COPY . .

# 6. Build the application (TypeScript → dist)
RUN npm run build

# 7. Remove devDependencies for production image
RUN npm prune --omit=dev

EXPOSE 3000

# 8. Run compiled app
CMD ["node", "dist/src/main.js"]
