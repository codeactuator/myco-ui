# Step 1: Build the React app
FROM node:18-alpine AS build
WORKDIR /app
# ARG to receive the API URL from the 'docker build' command
ARG REACT_APP_API_BASE_URL
COPY package*.json ./
RUN npm install
COPY . .
# Use the ARG when running the build
RUN REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL npm run build

# Step 2: Serve using nginx
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
