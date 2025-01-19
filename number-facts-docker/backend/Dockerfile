# WARNING: This Dockerfile is good enough. But it can definitely be improved for the mini-project.
FROM node:18.18.2-alpine
WORKDIR /opt/backend/
ENV NODE_ENV=production
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]

