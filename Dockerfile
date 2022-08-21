# FROM nginx:alpine

# EXPOSE 80/tcp
# EXPOSE 80/udp
# COPY nginx.conf /etc/nginx/nginx.conf
# WORKDIR /usr/share/nginx/html
# COPY dist/ .




# FROM nginx:alpine
# RUN npm install
# EXPOSE 80/tcp
# EXPOSE 80/udp
# COPY nginx.conf /etc/nginx/nginx.conf
# # WORKDIR /usr/share/nginx/html
# COPY /dist/alballam-booking-system-web/ /usr/share/nginx/html


# Stage 1

FROM node:10-alpine as build-step

RUN mkdir -p /app
WORKDIR /app

COPY package.json /app
RUN npm install

COPY . /app
RUN npm run prod-build
# Stage 2

FROM nginx:1.17.1-alpine
# COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build-step /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80/tcp
EXPOSE 80/udp
