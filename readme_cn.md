# NekoImageGallery.App

一款基于React的WebUI应用，用于[NekoImageGallery](https://github.com/hv0905/NekoImageGallery)

[English Documentation](readme.md)

## 截图

![Screenshot1](https://raw.githubusercontent.com/hv0905/NekoImageGallery/master/web/screenshots/1.png)
![Screenshot2](https://raw.githubusercontent.com/hv0905/NekoImageGallery/master/web/screenshots/2.png)
![Screenshot3](https://raw.githubusercontent.com/hv0905/NekoImageGallery/master/web/screenshots/3.png)
![Screenshot4](https://raw.githubusercontent.com/hv0905/NekoImageGallery/master/web/screenshots/4.png)

> 以上截图可能包含来自不同画师的版权图片，请不要将其用作其它用途。

## 起步

### 准备

#### 所需工具

- git
- Node.js
- yarn
- Visual Studio Code（强烈推荐）或其他代码编辑器

#### 安装依赖项

1. 克隆此仓库
2. 使用yarn安装依赖项

   ```shell
   yarn install
   ```

### 运行开发服务器

使用以下命令运行vite开发服务器

```shell
yarn run dev
```

### 生产部署

1. 更改环境文件以匹配您的生产环境

   ```shell
   cp env/.env.example env/.env.production.local
   code env/.env.production.local
   ```

2. 以生产模式构建项目

   ```shell
   yarn run build
   ```

3. 将`dist`文件夹部署到您自己的Web服务器

### Lint

使用以下命令对项目进行lint

```shell
yarn run lint
```

## 版权

版权所有2023 EdgeNeko

根据GPLv3许可证授权。