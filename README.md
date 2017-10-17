# tele-aria2

I have made you an aria2 bot you can't refuse

## Setup

1. Create your own bot and get its HTTP access token by using [@BotFather](https://telegram.me/botfather).
1. Add `tele-aria2.telegran-token=__YOUR_BOT_TOKEN__` to aria2 config file.
1. Get your unique user ID by using [@get_id_bot](https://t.me/get_id_bot).
1. Add `tele-aria2.telegran-id=__YOUR_UNIQUE_ID__` to aria2 config file(want multiple users? just use `,` to separate them).
1. (Optional) For mainland China users, recommend to use `tele-aria2.proxy` for proxy support, e.g `tele-aria2.proxy=socks5://127.0.0.1:6154/`.
1. `$ git clone https://github.com/HouCoder/tele-aria2.git`.

## Supported Actions

### addUri

This method adds a new download.

### tellActive

This method returns a list of active downloads.
