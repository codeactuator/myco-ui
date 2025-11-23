#!/bin/sh
# entrypoint.sh

# Create a config file that will be sourced by the main index.html
echo "window.API_BASE_URL = '${REACT_APP_API_BASE_URL}';" > /usr/share/nginx/html/config.js

# Add the script tag to index.html
sed -i 's|<div id="root"></div>|<script src="/config.js"></script><div id="root"></div>|' /usr/share/nginx/html/index.html

# Start nginx
nginx -g 'daemon off;'