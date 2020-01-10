FROM node:13.6.0-stretch-slim as builder
USER root

WORKDIR /
ADD ./package.json .
RUN yarn install
ADD  ./blog ./blog
RUN yarn run build

FROM nginx:1.17.7-alpine as runner
USER root
WORKDIR /root/
COPY --from=builder /blog/.vuepress/dist/ /usr/share/nginx/html