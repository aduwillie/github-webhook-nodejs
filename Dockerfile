FROM node:dubnium-alpine
WORKDIR /code
COPY . /code
RUN npm install
EXPOSE 80
CMD [ "node", "src/index.js" ]
