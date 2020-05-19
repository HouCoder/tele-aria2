# Tele-aria2

![Logo](./images/logo.png)

I have not worked on this project for a long time, as the COVID-19 storms in the world and I couldn't go outside, I decided to make something good for all, so I started to redo this project.

The newly rewritten project has a few advantages over the old:

1. Fully touch based, more easy to use, no command required to use this bot.
2. Real time notification, it's now using Aria2's Websocket protocol to communicate.
3. Better cli interface and config file support.

## Setup

1. Create your own bot and get its access token by using [@BotFather](https://telegram.me/botfather).
1. Get your unique user ID - https://stackoverflow.com/a/32777943/4480674.
1. (Optional) For mainland China users, be sure to have a proxy server running.
1. `$ npm install tele-aria2 -g`.
1. `$ tele-aria2 --help` to see how to get started.

## Usage

Once your bot is up and running, go back to Telegram and click Start:

![start](./images/tele-aria2.start.gif)

As you can see, all the action menus are instantly available to use, no command required!

### How can I add a new download task?

It's really simple, you just send the HTTP/FTP/SFTP/Magnet url to the chat, it will recognize it and add your will to the Aria2 server!

![start](./images/tele-aria2.download.gif)

**But I want to download from a torrent file**

No worries, just send your torrent file to the chat!

## Docker

## TODO

- [ ] Unit testing
