FROM node:12.20.0

ENV npm_config_platform=linux

WORKDIR /usr/src/apps/store-backend
COPY ./store-backend/package.json .
RUN yarn install

WORKDIR /usr/src/apps/store-frontend
COPY ./store-frontend/package.json .
RUN yarn install

WORKDIR /usr/src/apps/store-backend
COPY ./store-backend .
RUN ["yarn", "build"]

WORKDIR /usr/src/apps/store-frontend
COPY ./store-frontend .
RUN ["yarn", "build"]

WORKDIR /usr/src/apps
COPY ./run-all.sh ./run-all.sh
RUN ["chmod", "+x", "./run-all.sh"]

EXPOSE 1337
EXPOSE 3000
CMD ./run-all.sh