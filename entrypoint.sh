#!/bin/sh

# print all environment variables

if [ -n "$OVERRIDE_API_URL" ]; then
  echo "Overriding VITE_API_URL($VITE_API_URL) with $OVERRIDE_API_URL"
  sed -i "s|ApiUrl:\"$VITE_API_URL\"|ApiUrl:\"$OVERRIDE_API_URL\"|g" /data/assets/index-*.js
fi

if [ -n "$OVERRIDE_APP_DISPLAY_NAME" ]; then
  echo "Overriding VITE_APP_DISPLAY_NAME($VITE_APP_DISPLAY_NAME) with $OVERRIDE_APP_DISPLAY_NAME"
  sed -i "s|AppDisplayName:\"$VITE_APP_DISPLAY_NAME\"|AppDisplayName:\"$OVERRIDE_APP_DISPLAY_NAME\"|g" /data/assets/index-*.js
fi

/app/static --port 5000 --path /data --not-found-page /
