FROM node:18-alpine
RUN npm install -g nodemon
WORKDIR /app
COPY . .
RUN npm install
ENV DEBUG='bsSearch:*'
ENTRYPOINT ["npm", "run", "dev"]
