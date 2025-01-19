# WARNING: This Dockerfile is good enough. But it can definitely be improved for the mini-project.
FROM node:18.18.2-alpine AS dependencies
WORKDIR /tmp/build/
COPY package.json package-lock.json ./
RUN npm clean-install

FROM dependencies AS build
WORKDIR /tmp/build/
COPY . .
RUN npm run build

FROM nginx:1.25.2-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /tmp/build/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
