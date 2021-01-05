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

EXPOSE 1337
EXPOSE 3000
CMD [ "yarn", "develop" ]