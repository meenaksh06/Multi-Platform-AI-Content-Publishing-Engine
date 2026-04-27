FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies cleanly
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the application code
COPY . .

# Expose the API port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
