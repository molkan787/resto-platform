FROM node:12.20.0

WORKDIR /usr/src/apps/store-backend
COPY ./store-backend/package.json .
# COPY ./store-backend/yarn.lock .
RUN yarn install

WORKDIR /usr/src/apps/store-frontend
COPY ./store-frontend/package.json .
# COPY ./store-frontend/yarn.lock .
RUN yarn install

WORKDIR /usr/src/apps/store-backend
COPY ./store-backend .

WORKDIR /usr/src/apps/store-frontend
COPY ./store-frontend .

WORKDIR /usr/src/apps
COPY ./run-all.sh ./run-all.sh

EXPOSE 1337
EXPOSE 3000
CMD ./run-all.sh