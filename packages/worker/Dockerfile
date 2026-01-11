FROM node:18-alpine

WORKDIR /app

# 1. Copy worker package files (from root context)
COPY packages/worker/package*.json ./

# 2. Install ALL dependencies
RUN npm install

# 3. Copy Prisma schema from api package (from root context)
COPY packages/api/prisma ./prisma/

# 4. Generate Prisma client
RUN npx prisma generate

# 5. Copy worker source code (from root context)
COPY packages/worker/ .

# 6. Build the application (TypeScript → dist)
RUN npm run build

# 7. Remove devDependencies for smaller image
RUN npm prune --omit=dev

# 8. Start the app
CMD ["npm", "start"]
