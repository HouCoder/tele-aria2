#!/usr/bin/env python
# -*- coding: utf-8 -*-

from argparse import ArgumentParser
import src.toolkits as toolkits
from src.bot import Bot


def initial_args():
    parser = ArgumentParser()
    parser.add_argument('-c', '--config',
                        dest='config',
                        help='The path of your configuration file.',
                        required=True
                        )

    return parser.parse_args()


def config_validator(config):
    if 'tele-aria2.telegran-token' not in config:
        print('tele-aria2.telegran-token is required!')
        exit(1)

    if 'tele-aria2.telegran-id' not in config:
        print('tele-aria2.telegran-id is required!')
        exit(1)


def main():
    aria2_config = toolkits.config_reader(initial_args().config)
    config_validator(aria2_config)
    telegram_bot = Bot(aria2_config)
    telegram_bot.start()


if __name__ == '__main__':
    main()
