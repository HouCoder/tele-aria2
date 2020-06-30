FROM node:12.18.1-alpine3.9
MAINTAINER <aipeachpro@outlook.com>

COPY . /root/tele-aria2
WORKDIR /root/tele-aria2

RUN npm install tele-aria2 -g

VOLUME /etc/tele-aria2

CMD tele-aria2 -c /etc/tele-aria2/config.json
