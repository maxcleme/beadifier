#############################################################################
### Credit goes to : https://mherman.org/blog/dockerizing-an-angular-app/ ###
#############################################################################

# base image
FROM node:20.17.0-alpine as build

# set working directory
WORKDIR /app

# install app dependencies
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN npm ci

# add app
COPY . /app

# generate build
RUN npm run build:prod

# base image
FROM nginx:1.27.2-alpine-slim

# copy artifact build from the 'build environment'
COPY --from=build /app/dist/browser /usr/share/nginx/html

# expose port 80
EXPOSE 80

# run nginx
CMD ["nginx", "-g", "daemon off;"]