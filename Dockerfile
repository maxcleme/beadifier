#############################################################################
### Credit goes to : https://mherman.org/blog/dockerizing-an-angular-app/ ###
#############################################################################

# base image
FROM node:12.6.0 AS build

# set working directory
WORKDIR /app

# install app dependencies
RUN npm install -g yarn
COPY package.json /app/package.json
COPY yarn.lock /app/yarn.lock
RUN yarn

# add app
COPY . /app

# generate build
RUN yarn build:prod

# base image
FROM nginx:1.17.1-alpine

# copy artifact build from the 'build environment'
COPY --from=build /app/dist /usr/share/nginx/html

# expose port 80
EXPOSE 80

# run nginx
CMD ["nginx", "-g", "daemon off;"]