FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

RUN [ "npx", "prisma","generate" ]
CMD [ "npm", "start"]