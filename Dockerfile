FROM node:19-alpine3.16

RUN apk --update add ghostscript

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install --production
# If you are building your code for production
# RUN npm ci --only=production

RUN npm install pm2 -g

# Bundle app source
COPY . .

EXPOSE 6499
CMD [ "pm2-runtime","--json", "process.yml" ]