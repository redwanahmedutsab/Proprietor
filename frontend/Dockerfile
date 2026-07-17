# ---- Build stage ----
FROM node:18-bullseye-slim AS build

WORKDIR /app

# Build-time API URL (baked into the static bundle, CRA-style)
ARG REACT_APP_API_URL=http://localhost:8000/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

# ---- Serve stage ----
FROM nginx:1.27-alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
