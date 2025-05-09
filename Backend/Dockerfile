FROM node:18

WORKDIR /app

COPY package*.json ./

# Install nodemon globally
RUN npm install -g nodemon

# Install dependencies with platform-specific binaries
# Force rebuild of bcrypt for Linux
RUN npm install
RUN npm uninstall bcrypt
RUN npm install bcrypt --build-from-source

# Copy the rest of the application
COPY . .

EXPOSE 4000

CMD ["nodemon", "index.js"]
