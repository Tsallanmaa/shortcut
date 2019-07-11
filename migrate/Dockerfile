# Dockerfile
FROM mhart/alpine-node:12
WORKDIR /app
COPY . .
RUN yarn install

# Only copy over the node pieces we need from the above images
FROM mhart/alpine-node:slim-12
WORKDIR /app
COPY --from=0 /app/node_modules ./node_modules
COPY package.json .
COPY ./migrations ./migrations
CMD ["node", "node_modules/.bin/node-pg-migrate", "up"]