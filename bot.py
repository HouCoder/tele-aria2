from telegram.ext import Updater, CommandHandler
import logging
from Aria2 import Aria2

aria2_actions = Aria2('/Users/tonni/aria2.conf')

def start(bot, update):
	update.message.reply_text('\n'.join([
		'Welcome to tele-aria2 bot!',
		'Send /help to get help',
	]))

def help(bot, update):
	update.message.reply_text('\n'.join([
		'You can control your aria2 server by sending these commands:',
		'',
		'/addUri - Add a new download, it supports HTTP/FTP/SFTP/BitTorrent URI',
		'/tellActive - Return a list of active downloads',
	]))

def add_uri(bot, update, args):
	update.message.reply_text(
		aria2_actions.add_uri(args)
	)

def tell_active(bot, update):
	update.message.reply_text(
		aria2_actions.tell_active()
	)

logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO)

updater = Updater('YOUT_TOKEN')

updater.dispatcher.add_handler(CommandHandler('start', start))
updater.dispatcher.add_handler(CommandHandler('help', help))
updater.dispatcher.add_handler(CommandHandler('addUri', add_uri, pass_args=True))
updater.dispatcher.add_handler(CommandHandler('tellActive', tell_active))

updater.start_polling()
updater.idle()
