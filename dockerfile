FROM node:13.6.0-stretch-slim as builder
USER root

ADD ./package.json .
RUN yarn install
ADD  ./blog ./blog
RUN yarn run build
