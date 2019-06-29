FROM node:dubnium
WORKDIR /code
COPY . /code
RUN npm install
ENV LOCAL_REPO_DIR=/code
ENV GITHUB_REPO_BRANCH=master
EXPOSE 3000
CMD [ "node", "src/index.js" ]
