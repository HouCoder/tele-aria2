import ConfigParser

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


def config_reader(config_path):
    cp = ConfigParser.SafeConfigParser()
    with open(config_path) as configs:
        cp.readfp(_FakeSecHead(configs))

    # Use dict to convert result to dixt
    # https://stackoverflow.com/a/1773820/4480674
    return dict(cp.items('asection'))


def merge_two_dicts(*dict_args):
    """
    Given any number of dicts, shallow copy and merge into a new dict,
    precedence goes to key value pairs in latter dicts.
    https://stackoverflow.com/a/26853961/4480674
    """
    result = {}
    for dictionary in dict_args:
        result.update(dictionary)
    return result


def number_parser(num):
    # dropping trailing '.0' from floats
    # https://stackoverflow.com/a/12080042/4480674
    return '{0:g}'.format(round(num, 2))


def readable_size(byte):
    float_byte = float(byte)
    result = None

    kb = 1024
    mb = kb ** 2
    gb = kb ** 3

    if float_byte >= gb:
        # GB
        readable_gb = number_parser(float_byte / gb)
        result = str(readable_gb) + ' GB'
    elif float_byte >= mb:
        # MB
        readable_mb = number_parser(float_byte / mb)
        result = str(readable_mb) + ' MB'
    else:
        # KB
        readable_kb = number_parser(byte / kb)
        result = str(readable_kb) + ' KB'

    return result


def calculate_progress(total, completed):
    return str(number_parser(float(completed) / float(total) * 100)) + '%'

# https://stackoverflow.com/a/26781642/4480674


def humanize_time(amount, units='seconds'):
    def process_time(amount, units):
        INTERVALS = [1, 60,
                     60 * 60,
                     60 * 60 * 24,
                     60 * 60 * 24 * 7,
                     60 * 60 * 24 * 7 * 4,
                     60 * 60 * 24 * 7 * 4 * 12,
                     60 * 60 * 24 * 7 * 4 * 12 * 100,
                     60 * 60 * 24 * 7 * 4 * 12 * 100 * 10]
        NAMES = [('second', 'seconds'),
                 ('minute', 'minutes'),
                 ('hour', 'hours'),
                 ('day', 'days'),
                 ('week', 'weeks'),
                 ('month', 'months'),
                 ('year', 'years'),
                 ('century', 'centuries'),
                 ('millennium', 'millennia')]

        result = []

        unit = map(lambda a: a[1], NAMES).index(units)
        # Convert to seconds
        amount = amount * INTERVALS[unit]

        for i in range(len(NAMES) - 1, -1, -1):
            a = amount // INTERVALS[i]
            if a > 0:
                result.append((a, NAMES[i][1 % a]))
                amount -= a * INTERVALS[i]

        return result

    rd = process_time(int(amount), units)
    cont = 0
    for u in rd:
        if u[0] > 0:
            cont += 1

    buf = ''
    i = 0
    for u in rd:
        if u[0] > 0:
            buf += "%d %s" % (u[0], u[1])
            cont -= 1

        if i < (len(rd) - 1):
            if cont > 1:
                buf += ", "
            else:
                buf += " and "

        i += 1

    return buf
