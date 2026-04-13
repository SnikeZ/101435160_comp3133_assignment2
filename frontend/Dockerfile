# ---- Stage 1: build ----
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG BACKEND_URL=https://backend-comp3133.fly.dev

RUN npx ng build --configuration production \
    --define "BACKEND_URL=\"${BACKEND_URL}\""

# ---- Stage 2: serve ----
FROM nginx:alpine

COPY --from=builder /app/dist/front/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
