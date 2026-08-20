FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY src ./src
COPY tsconfig.json ./

EXPOSE 3000

RUN addgroup -S app && adduser -S app -G app
USER app

CMD ["npm", "start"]