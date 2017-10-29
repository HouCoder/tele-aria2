# tele-aria2

I have made you an aria2 bot you can't refuse

## Setup

1. Create your own bot and get its HTTP access token by using [@BotFather](https://telegram.me/botfather).
1. Add `tele-aria2.telegran-token=__YOUR_BOT_TOKEN__` to aria2 config file.
1. Get your unique user ID by using [@get_id_bot](https://t.me/get_id_bot).
1. Add `tele-aria2.telegran-id=__YOUR_UNIQUE_ID__` to aria2 config file(want multiple users? just use `,` to separate them).
1. (Optional) For mainland China users, recommend to use `tele-aria2.proxy` for proxy support, e.g `tele-aria2.proxy=socks5://127.0.0.1:6154/`.
1. `$ git clone https://github.com/HouCoder/tele-aria2.git`.
1. `$ pip install python-telegram-bot PySocks`.
1. `$ python main.py -c __aria2_path__`.

## Supported Actions

**Want add torrent task? just simply send the torrent to your bot.**

#### /add [uri]

Add a new download, it supports HTTP/FTP/SFTP/BitTorrent URI.

#### /remove [gid]

Remove download.

#### /pause [gid]

Pause download.

#### /pauseAll

Pause all downloads.

#### /unpause [gid]

Unpause download.

#### /unpauseAll

Unpause all downloads.

#### /tellActive

Return a list of active downloads.

#### /tellWaiting

Return a list of the latest 10 waiting downloads.

#### /tellStopped

Return a list of the latest 10 stopped downloads.

## Discussion & feedback

If you have any question, feel free to discuss at our Telegram channel - [tele-aria2](https://t.me/joinchat/BX8nShFgXeZKNOEjXKukNQ).
