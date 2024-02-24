FROM node:14.21.3-slim as builder
USER root

WORKDIR /app
ADD ./package.json .
ADD ./yarn.lock .
RUN yarn install --frozen-lockfile
ADD  ./src ./src
RUN npm run docs:build

FROM nginx:1.21.6-alpine as runner
USER root
WORKDIR /root/
COPY --from=builder /app/src/.vuepress/dist/ /usr/share/nginx/html
RUN chmod -R 777 /var/cache/nginx
