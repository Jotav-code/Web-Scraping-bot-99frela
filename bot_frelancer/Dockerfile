FROM mcr.microsoft.com/playwright:v1.41.2-focal

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

CMD ["node", "server.js"]
