export function byte2Readable(byte: number, prefix = ''): string {
  // 1kb is 1024 bytes
  const kb = 1024;
  const mb = kb * 1024;
  const gb = mb * 1024;
  let readable; let
    unit;

  if (byte >= gb) {
    // xx GB
    readable = byte / gb;
    unit = 'GB';
  } else if (byte < gb && byte >= mb) {
    // xx MB
    readable = byte / mb;
    unit = 'MB';
  } else {
    // xx KB
    readable = byte / kb;
    unit = 'KB';
  }

  return `${parseFloat(readable.toFixed(2))}${unit}${prefix}`;
}

// Use any to avoid complex type checking,
// or to use the same types as GeneralCallback to be precise.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getFilename(task: any): string {
  if (task.constructor !== Object) {
    return '';
  }

  // BT protocol
  if (task.bittorrent) {
    if (task.bittorrent.info) {
      // Actual BT download
      return task.bittorrent.info.name;
    }
    // Just the bittorrent file
    return task.files[0].path;
  }
  // HTTP protocol, get filename from download path, https://stackoverflow.com/a/58708800/4480674
  return task.files[0].path.split('/').splice(-1)[0];
}

export function progress(total: number, completed: number): string {
  // Return 0 if total is 0.
  return `${Number(((completed / total) * 100).toFixed(2)) || 0}%`;
}

// Get `540625cfdbfa6ccc` from `resume-task.540625cfdbfa6ccc`.
export function getGidFromAction(action: string): string {
  const splited = action.split('.');

  return splited.pop() || '';
}

// HTTP/FTP/SFTP/Magnet/BT file
// https://stackoverflow.com/a/8061352
export function isDownloadable(uri: string): boolean {
  const httpFtp = /^(https?|ftps?):\/\/.*$/;

  // https://stackoverflow.com/a/19707059
  const magnet = /magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{32}/i;

  const btFile = /\.torrent$/;

  return httpFtp.test(uri) || magnet.test(uri) || btFile.test(uri);
}
