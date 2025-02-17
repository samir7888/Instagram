FROM node:18

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application
COPY . . 

# Build the React app
RUN npm run build

# Check if build folder exists (DEBUGGING)
RUN ls -la build || echo "Build folder is missing!"

# Install Nginx
RUN apt-get update && apt-get install -y nginx



# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
