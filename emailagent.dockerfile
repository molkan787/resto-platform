FROM node:12.20.0

ENV npm_config_platform=linux

WORKDIR /usr/src/app
COPY ./email-agent/package.json .
COPY ./email-agent/yarn.lock .
RUN yarn install

COPY ./email-agent .

EXPOSE 3033
CMD node .