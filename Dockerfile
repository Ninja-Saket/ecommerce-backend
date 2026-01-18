# Use Node.js LTS version with Debian (better compatibility with native modules)
FROM node:20-slim

# Install necessary system dependencies for native modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port (adjust if your server uses a different port)
EXPOSE 8000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
