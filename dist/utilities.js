"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function byte2Readable(byte, prefix) {
    if (prefix === void 0) { prefix = ''; }
    // 1kb is 1024 bytes
    var kb = 1024;
    var mb = kb * 1024;
    var gb = mb * 1024;
    var readable;
    var unit;
    if (byte >= gb) {
        // xx GB
        readable = byte / gb;
        unit = 'GB';
    }
    else if (byte < gb && byte >= mb) {
        // xx MB
        readable = byte / mb;
        unit = 'MB';
    }
    else {
        // xx KB
        readable = byte / kb;
        unit = 'KB';
    }
    return "" + parseFloat(readable.toFixed(2)) + unit + prefix;
}
exports.byte2Readable = byte2Readable;
// Use any to avoid complex type checking,
// or to use the same types as GeneralCallback to be precise.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getFilename(task) {
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
exports.getFilename = getFilename;
function progress(total, completed) {
    // Return 0 if total is 0.
    return (Number(((completed / total) * 100).toFixed(2)) || 0) + "%";
}
exports.progress = progress;
// Get `540625cfdbfa6ccc` from `resume-task.540625cfdbfa6ccc`.
function getGidFromAction(action) {
    var splited = action.split('.');
    return splited.pop() || '';
}
exports.getGidFromAction = getGidFromAction;
// HTTP/FTP/SFTP/Magnet/BT file
// https://stackoverflow.com/a/8061352
function isDownloadable(uri) {
    var httpFtp = /^(https?|ftps?):\/\/.*$/;
    // https://stackoverflow.com/a/19707059
    var magnet = /magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{32}/i;
    var btFile = /\.torrent$/;
    return httpFtp.test(uri) || magnet.test(uri) || btFile.test(uri);
}
exports.isDownloadable = isDownloadable;
//# sourceMappingURL=utilities.js.map