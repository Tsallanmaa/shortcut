# Dockerfile
FROM mhart/alpine-node:12
WORKDIR /app
COPY . .
RUN yarn install && yarn run tsc

FROM mhart/alpine-node:12
WORKDIR /app
COPY package*.json yarn.lock ./
RUN yarn install --prod

# Only copy over the node pieces we need from the above images
FROM mhart/alpine-node:slim-12
WORKDIR /app
COPY --from=0 /app/build .
COPY --from=1 /app/node_modules ./node_modules
COPY ./conf/api.json .
CMD ["node", "main.js"]