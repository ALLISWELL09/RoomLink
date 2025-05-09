# frontend/Dockerfile
FROM node:18

WORKDIR /app

COPY package*.json ./

# Install dependencies with platform-specific binaries
RUN npm install

# Copy the rest of the application
COPY . .

# Configure Vite to listen on all interfaces
ENV VITE_HOST=0.0.0.0

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
