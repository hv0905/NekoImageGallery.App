# NekoImageGallery.App

This is a simple wrapper for the NekoImageGallery webapp, allowing it to be used as a Python package.

## Usage

```sh
# With pip
pip install neko-image-gallery-explorer

# With uv
uv add neko-image-gallery-explorer
```

Then, use it as an ASGI-compatible web server:

```python
import neko_image_gallery_explorer

from neko_image_gallery_explorer import asgi_app as frontend_app
```

You can mount the `frontend_app` in your ASGI application, or run it directly using a server like Uvicorn.

The webapp is built to use `/api` as the API endpoint, so you will need to make your api base URL `/api` to use it correctly.

## Original webapp documentation

Please checkout [the following link](https://github.com/hv0905/NekoImageGallery.App/blob/master/README.md) for readme of webapp.
