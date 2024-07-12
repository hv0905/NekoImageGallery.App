FROM hub.aiursoft.cn/node:21-alpine as yarn-env
WORKDIR /app
COPY ./package.json ./yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn run build

FROM hub.aiursoft.cn/aiursoft/static
COPY --from=yarn-env /app/dist /data

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT [ "/app/entrypoint.sh" ]
