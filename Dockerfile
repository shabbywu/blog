FROM node:14.21.3-slim as builder
USER root

WORKDIR /app
ADD ./package.json .
ADD ./yarn.lock .
RUN yarn install --frozen-lockfile
ADD  ./blog ./blog
RUN yarn run build

FROM nginx:1.21.6-alpine as runner
USER root
WORKDIR /root/
COPY --from=builder /app/blog/.vuepress/dist/ /usr/share/nginx/html
RUN chmod -R 777 /var/cache/nginx
