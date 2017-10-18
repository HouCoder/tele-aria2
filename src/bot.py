#!/usr/bin/env python
# -*- coding: utf-8 -*-

import logging
import telegram
import toolkits
from aria2 import Aria2
from telegram.ext import Updater, CommandHandler, MessageHandler, Filters, DispatcherHandlerStop


class Bot:
    def __init__(self, user_config):
        self.user_config = user_config
        self.__init_logging()
        self.aria2_actions = Aria2(self.user_config)
        self.updater = Updater(token=self.user_config['tele-aria2.telegran-token'], request_kwargs={
            'proxy_url': self.user_config['tele-aria2.proxy']
        })

    def __init_logging(self):
        """
        https://github.com/python-telegram-bot/python-telegram-bot/wiki/Exception-Handling#other-exceptions
        """
        logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                            level=logging.INFO)

    def __user_authentication(self, bot, update):
        authorized_users = self.user_config['tele-aria2.telegran-id'].split(',')

        # https://github.com/python-telegram-bot/python-telegram-bot/issues/849
        if str(update.message.from_user.id) not in authorized_users:
            update.message.reply_text('Unable to response to unauthorized user!')
            raise DispatcherHandlerStop

    def __add_handlers(self):
        self.updater.dispatcher.add_handler(CommandHandler('start', self.__command_start))
        self.updater.dispatcher.add_handler(CommandHandler('help', self.__command_help))
        self.updater.dispatcher.add_handler(CommandHandler('addUri', self.__command_add_uri, pass_args=True))
        self.updater.dispatcher.add_handler(CommandHandler('tellActive', self.__command_tell_active))
        self.updater.dispatcher.add_handler(CommandHandler('remove', self.__command_remove, pass_args=True))
        self.updater.dispatcher.add_handler(MessageHandler(Filters.all, self.__user_authentication), -1)

    def __command_start(self, bot, update):
        # print update.message.from_user
        update.message.reply_text('\n'.join([
            'Welcome to tele-aria2 bot!',
            'Send /help to get help',
        ]))

    def __command_help(self, bot, update):
        update.message.reply_text('\n'.join([
            'You can control your aria2 server by sending these commands:',
            '',
            '/addUri - Add a new download, it supports HTTP/FTP/SFTP/BitTorrent URI',
            '/tellActive - Return a list of active downloads',
            '/remove - Remove the download denoted by gid',
        ]))

    def __command_remove(self, bot, update, args):
        chat_id = update.message.chat_id

        bot.send_message(chat_id=chat_id,
                         text=self.aria2_actions.remove(args[0])
                         )

    def __command_add_uri(self, bot, update, args):
        chat_id = update.message.chat_id

        bot.send_message(chat_id=chat_id,
                         text=self.aria2_actions.add_uri(args)
                         )

    def __command_tell_active(self, bot, update):
        chat_id = update.message.chat_id
        data = self.aria2_actions.tell_active()
        response_text = []

        for download in data:
            task_name = None
            total_length = int(download['totalLength'])

            # Use total_length to determine whether the download is initialized.
            if total_length > 0:
                is_bittorrent = 'bittorrent' in download
                individual = []

                if is_bittorrent:
                    if 'info' in download['bittorrent']:
                        task_name = download['bittorrent']['info']['name']
                    else:
                        task_name = 'Unknown'
                else:
                    task_name = download['files'][0]['path'].split('/')[-1]

                individual.append('<b>Name:</b> ' + task_name)

                individual.append('<b>GID:</b> ' + download['gid'])

                completed_length = int(download['completedLength'])
                progress = toolkits.calculate_progress(total_length, completed_length)
                individual.append('<b>Progress:</b> ' + progress)

                individual.append('<b>Total Length:</b> ' + toolkits.readable_size(total_length))

                if total_length != completed_length:
                    download_speed = int(download['downloadSpeed'])
                    individual.append('<b>Download Speed:</b> ' + toolkits.readable_size(download_speed) + '/s')

                    eta = toolkits.humanize_time((total_length - completed_length) / download_speed)
                    individual.append('<b>ETA:</b> ' + eta)

                upload_length = int(download['uploadLength'])
                upload_speed = int(download['uploadSpeed'])
                individual.append('<b>Upload Length:</b> ' + toolkits.readable_size(upload_length))
                individual.append('<b>Upload Speed:</b> ' + toolkits.readable_size(upload_speed) + '/s')

                response_text.append('\n'.join(individual))
            else:
                # Only show name and gid if the download is not initialized.
                response_text.append('\n'.join([
                    '<b>Name:</b> Unknown',
                    '<b>GID:</b> ' + download['gid']
                ]))

        bot.send_message(chat_id=chat_id,
                         text='\n\n'.join(response_text),
                         parse_mode=telegram.ParseMode.HTML
                         )

    def start(self):
        self.__add_handlers()
        self.updater.start_polling()
        self.updater.idle()
