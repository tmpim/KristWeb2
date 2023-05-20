# Build app
FROM node:16-alpine AS build

RUN apk update && apk add git gzip

WORKDIR /build

COPY ["yarn.lock", "./"]
RUN yarn global add rimraf @craco/craco@^6.1.1

COPY ["package.json", "./"]
RUN yarn install

COPY . .

ENV NODE_ENV=production

ARG SENTRY_DSN
ARG SENTRY_ORG
ARG SENTRY_PROJECT
ARG SENTRY_TOKEN
ARG SENTRY_URL
ENV SENTRY_DSN=$SENTRY_DSN
ENV SENTRY_ORG=$SENTRY_ORG
ENV SENTRY_PROJECT=$SENTRY_PROJECT
ENV SENTRY_TOKEN=$SENTRY_TOKEN
ENV SENTRY_URL=$SENTRY_URL

RUN yarn run build
RUN yarn run optimise

# Copy the build files to the output folder (ideally volumed in) to be consumed
# by the webserver
FROM alpine

WORKDIR /build
COPY --from=build /build/build ./build

RUN mkdir out
CMD cp -r build/* out/
