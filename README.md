# NekoImageGallery.App

[![Gitlab pipeline status (self-managed)](https://img.shields.io/gitlab/pipeline-status/EdgeNeko%2FNekoImageGallery.App?gitlab_url=https%3A%2F%2Fgitlab.aiursoft.cn&branch=master&style=flat-square&logo=gitlab)](https://gitlab.aiursoft.cn/EdgeNeko/NekoImageGallery.App/pipelines)

A react webui app, for [NekoImageGallery](https://github.com/hv0905/NekoImageGallery)

[中文文档](readme_cn.md)

## Screenshots

![Screenshot1](https://raw.githubusercontent.com/hv0905/NekoImageGallery/master/web/screenshots/1.png)
![Screenshot2](https://raw.githubusercontent.com/hv0905/NekoImageGallery/master/web/screenshots/2.png)
![Screenshot3](https://raw.githubusercontent.com/hv0905/NekoImageGallery/master/web/screenshots/3.png)
![Screenshot4](https://raw.githubusercontent.com/hv0905/NekoImageGallery/master/web/screenshots/4.png)

> The above screenshots may contain copyrighted images from different artists, please do not use them for other purposes.

## Getting Started

### Prepare

#### Tools required

- git
- Node.js
- yarn(v4)
- Visual studio code (strongly recommended) or other code editor

#### Install dependencies

1. Clone this repository
2. Install dependencies using yarn

   ```shell
   yarn install
   ```

### Run development server

Use the following command to run vite development server

```shell
yarn run dev
```

### Production deployment

1. Change environment file to match your production environment

   ```shell
   cp env/.env.example env/.env.production.local
   code env/.env.production.local
   ```

2. Build the project in production mode

   ```shell
   yarn run build
   ```

3. Deploy the `dist` folder to your own web server

### Lint

Use the following command to lint the project

```shell
yarn run lint
```

## Copyright

Copyright 2023 EdgeNeko

Licensed under GPLv3 license.
