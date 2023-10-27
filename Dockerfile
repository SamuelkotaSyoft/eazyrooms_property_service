FROM node:18

WORKDIR /usr/src/eazyrooms_property_service

COPY package*.json ./

COPY . .

RUN npm install

EXPOSE 3002

CMD ["node", "server.js"]