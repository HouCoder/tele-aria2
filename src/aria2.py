#!/usr/bin/env python
# -*- coding: utf-8 -*-

import xmlrpclib
import toolkits


class Aria2:
    def __init__(self, user_config):
        self.aria2_config = self.__prepare_config(user_config)
        self.server = self.__establish_server_connection()
        self.token = 'token:' + self.aria2_config['rpc-secret']

    def __prepare_config(self, user_config):
        default_config = {
            'rpc-listen-port': 6800,
            'tele-aria2.host': 'http://127.0.0.1',
        }

        return toolkits.merge_two_dicts(default_config, user_config)

    def __establish_server_connection(self):
        host = self.aria2_config['tele-aria2.host']
        port = str(self.aria2_config['rpc-listen-port'])

        return xmlrpclib.ServerProxy(host + ':' + port + '/rpc')

    def add_uri(self, uri):
        response_gid = None

        try:
            response_gid = self.server.aria2.addUri(self.token, uri)
        except xmlrpclib.Fault as err:
            return str(err)

        return 'Download added, GID#' + response_gid

    def add_torrent(self):
        pass

    def add_metalink(self):
        pass

    def remove(self, gid):
        try:
            self.server.aria2.remove(self.token, gid)
        except xmlrpclib.Fault as err:
            return str(err)

        return 'Download removed, GID#' + gid

    def force_remove(self, gid):
        try:
            self.server.aria2.forceRemove(self.token, gid)
        except xmlrpclib.Fault as err:
            return str(err)

        return 'Download force removed, GID#' + gid

    def pause(self, gid):
        try:
            self.server.aria2.pause(self.token, gid)
        except xmlrpclib.Fault as err:
            return str(err)

        return 'Download paused, GID#' + gid

    def pause_all(self):
        try:
            self.server.aria2.pauseAll(self.token)
        except xmlrpclib.Fault as err:
            return str(err)

        return 'Downloads paused'

    def force_pause(self, gid):
        try:
            self.server.aria2.forcePause(self.token, gid)
        except xmlrpclib.Fault as err:
            return str(err)

        return 'Download force paused, GID#' + gid

    def force_pause_all(self):
        try:
            self.server.aria2.forcePauseAll(self.token)
        except xmlrpclib.Fault as err:
            return str(err)

        return 'Downloads force paused'

    def unpause(self, gid):
        try:
            self.server.aria2.unpause(self.token, gid)
        except xmlrpclib.Fault as err:
            return str(err)

        return 'Download unpaused, GID#' + gid

    def unpause_all(self):
        try:
            self.server.aria2.unpauseAll(self.token)
        except xmlrpclib.Fault as err:
            return str(err)

        return 'Downloads unpaused'

    def tell_active(self):
        return self.server.aria2.tellActive(self.token)

    def tell_waiting(self):
        return self.server.aria2.tellWaiting(self.token, -1, 10)

    def tell_stopped(self):
        return self.server.aria2.tellStopped(self.token, -1, 10)
