# Dockerfile
FROM mhart/alpine-node:12
WORKDIR /app
COPY . .
RUN yarn install
RUN ./node_modules/.bin/webpack

FROM alpine:latest
RUN apk add --update nginx && rm -rf /var/cache/apk/*
ADD ./server/nginx.conf /etc/nginx/nginx.conf
RUN mkdir -p /data/www
COPY index.html /data/www
COPY --from=0 /app/dist /data/www/dist

EXPOSE 80

CMD ["nginx"]


# FROM mhart/alpine-node:12
# WORKDIR /app
# COPY . .
# RUN yarn install --prod

# FROM mhart/alpine-node:slim-12
# WORKDIR /app
# COPY --from=0 /app/dist ./dist
# COPY --from=1 /app/node_modules ./node_modules
# COPY server.js ./
# COPY index.html ./dist
# CMD ["node", "server.js"]