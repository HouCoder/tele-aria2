import ConfigParser, xmlrpclib

# https://stackoverflow.com/a/2819788/4480674
class _FakeSecHead(object):
    def __init__(self, fp):
        self.fp = fp
        self.sechead = '[asection]\n'

    def readline(self):
        if self.sechead:
            try:
                return self.sechead
            finally:
                self.sechead = None
        else:
            return self.fp.readline()


def _merge_two_dicts(*dict_args):
    """
    Given any number of dicts, shallow copy and merge into a new dict,
    precedence goes to key value pairs in latter dicts.
    https://stackoverflow.com/a/26853961/4480674
    """
    result = {}
    for dictionary in dict_args:
        result.update(dictionary)
    return result

class Aria2:
    def __init__(self, config_path):
        self.aria2_config = self.parse_config_file(config_path)
        self.server = self.establish_server_connection()
        self.token = 'token:' + self.aria2_config['rpc-secret']

    def parse_config_file(self, path):
        cp = ConfigParser.SafeConfigParser()
        cp.readfp(_FakeSecHead(open(path)))

        default_config = {
            'rpc-listen-port': 6800,
        }

        # Use dict to convert result to dixt - https://stackoverflow.com/a/1773820/4480674
        return _merge_two_dicts(default_config, dict(cp.items('asection')))

    def establish_server_connection(self):
        return xmlrpclib.ServerProxy('http://127.0.0.1:' + str(self.aria2_config['rpc-listen-port']) + '/rpc')

    def add_uri(self, uri):
        response_gid = None

        try:
            response_gid = self.server.aria2.addUri(self.token, uri)
        except xmlrpclib.Fault as err:
            return 'Add task failed! code: ' + str(err.faultCode) + ', message: ' + err.faultString

        return 'Task added, gid: ' + response_gid

    def add_torrent(self):
        pass

    def add_metalink(self):
        pass

    def remove(self, gid):
        return self.server.aria2.remove(self.token, gid)

    def force_remove(self, gid):
        return self.server.aria2.forceRemove(self.token, gid)

    def pause(self, gid):
        return self.server.aria2.pause(self.token, gid)

    def pause_all(self):
        return self.server.aria2.pauseAll(self.token)

    def force_pause(self, gid):
        return self.server.aria2.forcePause(self.token, gid)

    def force_pause_all(self):
        return self.server.aria2.forcePauseAll(self.token)

    def unpause(self, gid):
        return self.server.aria2.unpause(self.token, gid)

    def unpause_all(self, gid):
        return self.server.aria2.unpauseAll(self.token)

    def tell_active(self):
        return self.server.aria2.tellActive(self.token)

    def tell_waiting(self):
        return self.server.aria2.tellStopped(self.token)

    def tell_stopped(self):
        return self.server.aria2.tellStopped(self.token)

    def tell_status(self, gid):
        return self.server.aria2.tellStatus(self.token, gid)
