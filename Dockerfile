FROM hub.aiursoft.cn/node:21-alpine as yarn-env
WORKDIR /app
COPY ./package.json ./yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn run build

FROM hub.aiursoft.cn/aiursoft/static
COPY --from=yarn-env /app/dist /data

ENTRYPOINT [ "/app/static", "--port", "5000", "--path", "/data", "--not-found-page", "/" ]