FROM node:12.20.0

ENV npm_config_platform=linux

WORKDIR /usr/src/app
COPY ./distance-helper/package.json .
RUN yarn install

COPY ./distance-helper .

EXPOSE 1338
CMD node .