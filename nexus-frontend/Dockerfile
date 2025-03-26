# 1. Use a Node image to build the project
FROM node:18-alpine AS build

# 2. Set the working directory
WORKDIR /app

# 3. Copy package.json and package-lock.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# 4. Copy the rest of the code and build the Angular app
COPY . .
RUN npm run build

RUN ls -la /app/dist/nexus-frontend
# 5. Use a lightweight web server image for the finished frontend
FROM nginx:alpine

# 6. Copy the built Angular project into the Nginx web server
COPY --from=build /app/dist/nexus-frontend/browser /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# 7. Expose the port for the container
EXPOSE 80

# 8. Start the Nginx server
CMD ["nginx", "-g", "daemon off;"]
