# Render shu faylni o'qib, botga uy quradi.
FROM node:20-slim

# Serverdagi Chrome (PDF shu bilan chiziladi) va shriftlar
RUN apt-get update && apt-get install -y --no-install-recommends \
      chromium ca-certificates fonts-liberation fonts-dejavu-core \
      fonts-noto-core fonts-noto-cjk-extra \
    && rm -rf /var/lib/apt/lists/*

ENV CHROME_PATH=/usr/bin/chromium
ENV NODE_ENV=production

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev

COPY . .
EXPOSE 10000
CMD ["node", "src/index.js"]
