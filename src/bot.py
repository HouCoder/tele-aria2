#!/usr/bin/env python
# -*- coding: utf-8 -*-

import logging
import telegram
import toolkits
from aria2 import Aria2
from telegram.ext import Updater, CommandHandler, MessageHandler, Filters, DispatcherHandlerStop
from telegram.error import TelegramError


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
        add_handler = self.updater.dispatcher.add_handler

        add_handler(CommandHandler('start', self.__command_start))
        add_handler(CommandHandler('help', self.__command_help))
        add_handler(CommandHandler('addUri', self.__command_add_uri, pass_args=True))

        add_handler(CommandHandler('tellActive', self.__tell_something('tell_active')))
        add_handler(CommandHandler('tellWaiting', self.__tell_something('tell_waiting')))
        add_handler(CommandHandler('tellStopped', self.__tell_something('tell_stopped')))

        add_handler(CommandHandler('remove', self.__do_something('remove'), pass_args=True))
        add_handler(CommandHandler('forceRemove', self.__do_something('force_remove'), pass_args=True))

        add_handler(CommandHandler('pause', self.__do_something('pause'), pass_args=True))
        add_handler(CommandHandler('forcePause', self.__do_something('force_pause'), pass_args=True))

        add_handler(CommandHandler('pauseAll', self.__do_something('pause_all', False)))
        add_handler(CommandHandler('forcePauseAll', self.__do_something('force_pause_all', False)))

        add_handler(CommandHandler('unpause', self.__do_something('unpause'), pass_args=True))
        add_handler(CommandHandler('unpauseAll', self.__do_something('unpause_all', False)))

        add_handler(MessageHandler(Filters.all, self.__user_authentication), -1)

    def __command_start(self, bot, update):
        update.message.reply_text('\n'.join([
            'Welcome to tele-aria2 bot!',
            'Send /help to get help',
        ]))

    def __command_help(self, bot, update):
        update.message.reply_text('\n'.join([
            'You can control your aria2 server by sending these commands:',
            '',
            '/addUri [uri] - Add a new download, it supports HTTP/FTP/SFTP/BitTorrent URI',
            '/remove [gid] - Remove download',
            '/forceRemove [gid] - Force remove download',
            '/pause [gid] - Pause download',
            '/forcePause [gid] - Force pause download',
            '/pauseAll - Pause all downloads',
            '/forcePauseAll - Force pause all downloads',
            '/unpause [gid] - Unpause download',
            '/unpauseAll - Unpause all downloads',
            '/tellActive - Return a list of active downloads',
            '/tellWaiting - Return a list of waiting downloads',
            '/tellStopped - Return a list of stopped downloads',
        ]))

    def __command_add_uri(self, bot, update, args):
        response = None
        if args:
            response = self.aria2_actions.add_uri(args)
        else:
            response = 'Please provide a link to download.'

        chat_id = update.message.chat_id
        bot.send_message(chat_id=chat_id, text=response)

    def __do_something(self, task, require_gid=True):
        def run_action(bot, update, args=None):
            response = None

            if require_gid and not args:
                response = 'Please provide a gid.'
            else:
                # https://stackoverflow.com/a/3071/4480674
                action = getattr(self.aria2_actions, task)

                if args:
                    response = action(args[0])
                else:
                    response = action()

            chat_id = update.message.chat_id
            bot.send_message(chat_id=chat_id,
                             text=response
                             )

        return run_action

    def __tell_something(self, what):

        def echo_result(bot, update, args=None):
            chat_id = update.message.chat_id
            aria2_response = None

            # https://stackoverflow.com/a/3071/4480674
            action = getattr(self.aria2_actions, what)

            if args:
                aria2_response = action(args)
            else:
                aria2_response = action()

            response_text = None

            # If aria2_response is not empty
            if aria2_response:
                response_text = self.__response_parser(aria2_response)

            else:
                response_text = 'No available data'

            bot.send_message(chat_id=chat_id,
                             text=response_text,
                             parse_mode=telegram.ParseMode.HTML
                             )

        return echo_result

    def __response_parser(self, data):
        response_list = []
        response_text = None

        for download in data:
            total_length = int(download['totalLength'])
            status = download['status']

            # Use total_length to determine whether the download is initialized.
            if total_length > 0:
                is_bittorrent = 'bittorrent' in download
                individual = []
                task_name = None

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

                if status in ['active', 'paused']:
                    progress = toolkits.calculate_progress(total_length, completed_length)
                    individual.append('<b>Progress:</b> ' + progress)

                need_total_length = need_upload_length = status in ['active', 'paused', 'complete']

                if need_total_length:
                    individual.append('<b>Total Length:</b> ' + toolkits.readable_size(total_length))

                if status == 'active' and total_length != completed_length:
                    download_speed = int(download['downloadSpeed'])
                    individual.append('<b>Download Speed:</b> ' + toolkits.readable_size(download_speed) + '/s')

                    if download_speed > 0:
                        eta = toolkits.humanize_time((total_length - completed_length) / download_speed)
                        individual.append('<b>ETA:</b> ' + eta)

                upload_length = int(download['uploadLength'])

                if upload_length and need_upload_length:
                    individual.append('<b>Upload Length:</b> ' + toolkits.readable_size(upload_length))

                upload_speed = int(download['uploadSpeed'])

                if upload_speed and status is 'active':
                    individual.append('<b>Upload Speed:</b> ' + toolkits.readable_size(upload_speed) + '/s')

                response_list.append('\n'.join(individual))
            else:
                # Only show name and gid if the download is not initialized.
                response_list.append('\n'.join([
                    '<b>Name:</b> Unknown',
                    '<b>GID:</b> ' + download['gid']
                ]))

            response_text = '\n\n'.join(response_list)

        return response_text

    def __error_callback(self, bot, update, error):
        """
        https://github.com/python-telegram-bot/python-telegram-bot/wiki/Exception-Handling
        """
        try:
            raise error
        except TelegramError as err:
            print err

    def start(self):
        self.__add_handlers()
        self.updater.dispatcher.add_error_handler(self.__error_callback)
        self.updater.start_polling()
        self.updater.idle()
