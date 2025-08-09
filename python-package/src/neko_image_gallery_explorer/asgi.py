from pathlib import Path

from starlette.applications import Starlette

from starlette.routing import Mount
from starlette.staticfiles import StaticFiles

static_file_path = Path(__file__).parent / 'static'

routes = [
    Mount("/", app=StaticFiles(directory=static_file_path, html=True), name="static"),
]

asgi_app = Starlette(routes=routes)
