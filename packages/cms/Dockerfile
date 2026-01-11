FROM node:18-alpine

WORKDIR /app

# 1. Copy package files
COPY package*.json ./

# 2. Install ALL dependencies (including dev, needed for tsc)
RUN npm install

# 3. Copy source code
COPY . .

# 4. Build the application (TypeScript → dist)
RUN npm run build

# 5. Remove devDependencies for smaller image
RUN npm prune --omit=dev

# 6. Start the app
CMD ["npm", "start"]
