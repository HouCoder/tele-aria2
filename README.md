# tele-aria2

![Logo](https://raw.githubusercontent.com/HouCoder/tele-aria2/HEAD/images/logo.png)

[![NPM Version][npm-image]][npm-url]
[![GitHub Actions][github-image]][github-url]
[![TypeScript Style Guide][gts-image]][gts-url]
[![deps][deps]][deps-url]

The newly rewritten project has a few advantages over [the old one](https://github.com/HouCoder/tele-aria2/tree/legacy-python):

1. Fully touch based, more easy to use, no command required to use this bot.
2. Real time notification, it's now using Aria2's Websocket protocol to communicate.
3. Better cli interface and config file support.

## Setup

1. Create your own bot and get its access token by using [@BotFather](https://telegram.me/botfather).
1. Get your unique user ID - https://stackoverflow.com/a/32777943/4480674.
1. (Optional) Telegram blocked in your region/country? be sure to have a **HTTP** proxy up and running.
1. `$ npm install tele-aria2 -g`.
1. `$ tele-aria2 --help` to see how to get started.

## 3 ways to pass parameters

You can pass parameters to tele-aria2 in 3 ways:

1. cli
2. environment variable
3. configuration file

Option priorities also follow this order, so cli has the highest priority.

|                             	| Aria2 server    	| Aria2 key    	| Telegram bot key 	| Telegram user id 	| Proxy       	| Max items in range(default 20) 	|
|-----------------------------	|-----------------	|--------------	|------------------	|------------------	|-------------	|--------------------------------	|
| cli option                  	| --aria2-server  	| --aria2-key  	| --bot-key        	| --user-id        	| --proxy     	| --max-index                    	|
| environment variable option 	| ta.aria2-server 	| ta.aria2-key 	| ta.bot-key       	| ta.user-id       	| https_proxy 	| ta.max-index                   	|
| configuration file option   	| aria2-server    	| aria2-key    	| bot-key          	| user-id          	| proxy       	| max-index                      	|

### configuration file example

```json
{
  "aria2-server": "ws://192.168.1.154:6800/jsonrpc",
  "aria2-key": "xxx",
  "proxy": "http://127.0.0.1:7890",
  "bot-key": "123456789:xxx",
  "user-id": "123456",
  "max-index": 10
}
```

Need to add more users? no problem, just add `user-id` like this: `"user-id": "123,456,789"`.

## Usage

Once your bot is up and running, go back to Telegram and click **Start**:

<img src="https://raw.githubusercontent.com/HouCoder/tele-aria2/HEAD/images/tele-aria2.start.gif" alt="start" width="400px">

As you can see, all the action menus are instantly available to use, no command required!

### How can I add a new task?

It's really simple, you just send any HTTP/FTP/SFTP/Magnet url to chat, it will recognize and add it to Aria2 server!

<img src="https://raw.githubusercontent.com/HouCoder/tele-aria2/HEAD/images/tele-aria2.download.gif" alt="start" width="400px">

**But I want to download from a torrent file**

No worries, just send your torrent file to chat!

<img src="https://raw.githubusercontent.com/HouCoder/tele-aria2/HEAD/images/tele-aria2.bt.png" alt="start" width="400px">

## Docker

Run this bot as a Docker container, multi-architecture supported:

```
$ docker run -it \
  -v ~/.tele-aria2.json:/tele-aria2/config.json \
  --net=host \
  houcoder/tele-aria2
```

Keep in mind, the `--net=host` option is required if you have `proxy` set in your config file.

[deps]: https://img.shields.io/david/HouCoder/tele-aria2.svg
[deps-url]: https://david-dm.org/HouCoder/tele-aria2
[npm-image]: https://img.shields.io/npm/v/tele-aria2.svg
[npm-url]: https://npmjs.org/package/tele-aria2
[github-image]: https://github.com/HouCoder/tele-aria2/workflows/ci/badge.svg
[github-url]: https://github.com/HouCoder/tele-aria2/actions
[gts-image]: https://img.shields.io/badge/code%20style-google-blueviolet.svg
[gts-url]: https://github.com/google/gts
