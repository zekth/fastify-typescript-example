ARG NODE_VERSION
ARG GIT_COMMIT

FROM node:${NODE_VERSION} as build-img
WORKDIR /app

RUN apt-get update && apt-get install -y jq

COPY ./ /app

RUN npm ci
RUN npm run build:ci

# deleting the dev dependencies using npm otherwise
# some security tooling raise false positives
RUN cat package.json | jq -r '.devDependencies | to_entries | .[].key' | xargs npm uninstall

# pruning the node_modules and installing the production
# dependencies. 
RUN rm -rf node_modules && \
    npm ci --production

FROM node:${NODE_VERSION}
ARG GIT_COMMIT
USER node

LABEL revision="${GIT_COMMIT}"

ENV FASTIFY_LISTEN=3000

COPY --chown=node:node --from=build-img /app/dist /app/dist
COPY --chown=node:node --from=build-img /app/node_modules /app/node_modules

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s \
  CMD curl -f http://localhost:$FASTIFY_LISTEN/health || exit 1

CMD ["node", "/app/dist/app.js"]
