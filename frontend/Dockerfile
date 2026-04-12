FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4200

CMD ["sh", "-c", "npx ng serve --host 0.0.0.0 --poll 500 --define \"BACKEND_URL=\\\"${BACKEND_URL:-http://localhost:8000}\\\"\""]
