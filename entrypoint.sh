#!/bin/sh

# print all environment variables

if [ -n "$VITE_API_URL" ]; then
  echo "Overriding VITE_API_URL with $VITE_API_URL"
  sed -i "s|ApiUrl:\"http://localhost:8000\"|ApiUrl:\"$VITE_API_URL\"|g" /data/assets/index-*.js
fi

if [ -n "$VITE_APP_DISPLAY_NAME" ]; then
  echo "Overriding VITE_APP_DISPLAY_NAME with $VITE_APP_DISPLAY_NAME"
  sed -i "s|AppDisplayName:\"Neko Image Gallery\"|AppDisplayName:\"$VITE_APP_DISPLAY_NAME\"|g" /data/assets/index-*.js
fi

/app/static --port 5000 --path /data --not-found-page /
