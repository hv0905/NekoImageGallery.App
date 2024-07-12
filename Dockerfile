ARG API_URL=/api
ARG APP_DISPLAY_NAME=NekoImageGallery

FROM hub.aiursoft.cn/node:21-alpine as yarn-env
WORKDIR /app
COPY ./package.json ./yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .

ARG API_URL
ARG APP_DISPLAY_NAME

ENV VITE_API_URL=${API_URL} \
    VITE_APP_DISPLAY_NAME=${APP_DISPLAY_NAME}

RUN yarn run build

FROM hub.aiursoft.cn/aiursoft/static
COPY --from=yarn-env /app/dist /data

ARG API_URL
ARG APP_DISPLAY_NAME

ENV VITE_API_URL=${API_URL} \
    VITE_APP_DISPLAY_NAME=${APP_DISPLAY_NAME}

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT [ "/app/entrypoint.sh" ]
