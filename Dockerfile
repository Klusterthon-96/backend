FROM node:alpine
WORKDIR /usr/src/app
COPY package*.json ./

RUN npm ci

RUN apk update && \
    apk add --no-cache python3


COPY . .

RUN npm run build

CMD ["npm", "run","dev"]
