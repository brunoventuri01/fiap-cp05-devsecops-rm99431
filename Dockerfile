FROM nginx:1.20.0
COPY index.html /usr/share/nginx/html/index.html
COPY app.js /usr/share/nginx/html/app.js
EXPOSE 80
