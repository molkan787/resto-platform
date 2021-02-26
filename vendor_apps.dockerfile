FROM node:12.20.0

ENV npm_config_platform=linux


WORKDIR /usr/src/apps/murew-core
COPY ./murew-core/package.json .
COPY ./murew-core/yarn.lock .
RUN yarn install

WORKDIR /usr/src/apps/store-backend
COPY ./store-backend/package.json .
RUN yarn install

WORKDIR /usr/src/apps/store-frontend
COPY ./store-frontend/package.json .
COPY ./store-frontend/yarn.lock .
RUN yarn install


WORKDIR /usr/src/apps/murew-core
COPY ./murew-core .
RUN ["yarn", "build"]
RUN ["yarn", "link"]

WORKDIR /usr/src/apps/store-backend
COPY ./store-backend .
RUN ["yarn", "link", "murew-core"]
RUN ["yarn", "build"]

WORKDIR /usr/src/apps/store-frontend
COPY ./store-frontend .
RUN ["yarn", "link", "murew-core"]
RUN ["yarn", "build"]

WORKDIR /usr/src/apps
COPY ./run-all.sh ./run-all.sh
RUN ["chmod", "+x", "./run-all.sh"]

EXPOSE 1337
EXPOSE 3000
CMD ./run-all.sh