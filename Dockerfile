FROM node:12-alpine

WORKDIR /tele-aria2

RUN npm install tele-aria2@0.2.0-beta.13 -g

VOLUME /tele-aria2

ENTRYPOINT ["tele-aria2", "-c", "/tele-aria2/config.json"]
