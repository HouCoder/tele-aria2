#!/usr/bin/env python
# -*- coding: utf-8 -*-

import xmlrpc.client
import src.toolkits as toolkits


class Aria2:
    def __init__(self, user_config):
        self.aria2_config = self.__prepare_config(user_config)
        self.server = self.__establish_server_connection()
        self.token = 'token:' + self.aria2_config['aria2-rpc-secret']

    def __prepare_config(self, user_config):
        default_config = {
            'aria2-rpc-port': 6800,
            'aria2-rpc-host': 'http://127.0.0.1',
            'aria2-rpc-secret': '',
        }

        return toolkits.merge_two_dicts(default_config, user_config)

    def __establish_server_connection(self):
        host = self.aria2_config['aria2-rpc-host']
        port = str(self.aria2_config['aria2-rpc-port'])

        return xmlrpc.client.ServerProxy(host + ':' + port + '/rpc')

    def add_uri(self, uri):
        response_gid = None

        try:
            response_gid = self.server.aria2.addUri(self.token, uri)
        except xmlrpc.client.Fault as err:
            return str(err)

        return 'Download added, GID#' + response_gid

    def add_torrent(self, torrent_path):
        torrent = xmlrpc.client.Binary(open(torrent_path, mode='rb').read())
        response_gid = None

        try:
            response_gid = self.server.aria2.addTorrent(self.token, torrent)
        except xmlrpc.client.Fault as err:
            return str(err)

        return 'Torrent add, GID#' + response_gid

    def force_remove(self, gid):
        try:
            self.server.aria2.forceRemove(self.token, gid)
        except xmlrpc.client.Fault as err:
            return str(err)

        return 'Download removed, GID#' + gid

    def force_pause(self, gid):
        try:
            self.server.aria2.forcePause(self.token, gid)
        except xmlrpc.client.Fault as err:
            return str(err)

        return 'Download paused, GID#' + gid

    def force_pause_all(self):
        try:
            self.server.aria2.forcePauseAll(self.token)
        except xmlrpc.client.Fault as err:
            return str(err)

        return 'All downloads paused'

    def unpause(self, gid):
        try:
            self.server.aria2.unpause(self.token, gid)
        except xmlrpc.client.Fault as err:
            return str(err)

        return 'Download unpaused, GID#' + gid

    def unpause_all(self):
        try:
            self.server.aria2.unpauseAll(self.token)
        except xmlrpc.client.Fault as err:
            return str(err)

        return 'All downloads unpaused'

    def tell_active(self):
        return self.server.aria2.tellActive(self.token)

    def tell_waiting(self):
        return self.server.aria2.tellWaiting(self.token, -1, 10)

    def tell_stopped(self):
        return self.server.aria2.tellStopped(self.token, -1, 10)
