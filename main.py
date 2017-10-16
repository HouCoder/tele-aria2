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
    pass

def main():
    aria2_config = toolkits.config_reader(initial_args().config)
    telegram_bot = Bot(aria2_config)
    telegram_bot.start()

if __name__ == '__main__':
    main()
