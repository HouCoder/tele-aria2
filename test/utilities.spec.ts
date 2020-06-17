import { expect } from 'chai';
import 'mocha';
import * as utilities from '../src/utilities';

describe('Byte to readable', () => {
  it('Should return 1KB', () => {
    const result = utilities.byte2Readable(1024);
    expect(result).to.equal('1KB');
  });

  it('Should return 0.1KB', () => {
    const result = utilities.byte2Readable(102.4);
    expect(result).to.equal('0.1KB');
  });

  it('Should return 1MB', () => {
    const result = utilities.byte2Readable(1024 * 1024);
    expect(result).to.equal('1MB');
  });

  it('Should return 1GB', () => {
    const result = utilities.byte2Readable(1024 * 1024 * 1024);
    expect(result).to.equal('1GB');
  });

  it('Should return 1.5GB', () => {
    const result = utilities.byte2Readable(1610612736);
    expect(result).to.equal('1.5GB');
  });

  it('Should return 1.5MB/s', () => {
    const result = utilities.byte2Readable(1572863, '/s');
    expect(result).to.equal('1.5MB/s');
  });
});

describe('Get filename', () => {
  it('Should get the file name of a BT download task', () => {
    const task = {
      bittorrent: {
        info: {
          name: 'Better call saul',
        },
      },
    };

    expect(utilities.getFilename(task)).to.equal('Better call saul');
  });

  it('Should get an empty string if task is not an object', () => {
    const task = '';

    expect(utilities.getFilename(task)).to.equal('');
  });

  it('Should get the filename of a simple HTTP protocol', () => {
    const task = {
      files: [{
        path: '/downloads/PCQQ2020.exe',
      }],
    };

    expect(utilities.getFilename(task)).to.equal('PCQQ2020.exe');
  });

  it('Should get the filename of a bittorrent file download task', () => {
    const task = {
      files: [{
        path: 'Full Metal Jacket',
      }],
    };

    expect(utilities.getFilename(task)).to.equal('Full Metal Jacket');
  });
});

describe('Calculate progress', () => {
  it('Should return 0%', () => {
    expect(utilities.progress(100, 0)).to.equal('0%');
  });

  it('Should return 10.12%', () => {
    expect(utilities.progress(100, 10.12)).to.equal('10.12%');
  });

  it('Should return 100%', () => {
    expect(utilities.progress(100, 100)).to.equal('100%');
  });
});

describe('Determine if a uri is downloadable or not', () => {
  it('Should be true for HTTP uri', () => {
    expect(utilities.isDownloadable('http://www.qq.com')).to.be.true;
  });

  it('Should be true for HTTPs uri', () => {
    expect(utilities.isDownloadable('https://www.qq.com')).to.be.true;
  });

  it('Should be true for FTP uri', () => {
    expect(utilities.isDownloadable('ftp://speedtest.tele2.net')).to.be.true;
  });

  it('Should be true for FTPs uri', () => {
    expect(utilities.isDownloadable('ftps://speedtest.tele2.net')).to.be.true;
  });

  it('Should be true for Magnet uri', () => {
    const magnetUrl = 'magnet:?xt=urn:btih:d540fc48eb12f2833163eed6421d449dd8f1ce1f';
    expect(utilities.isDownloadable(magnetUrl)).to.be.true;
  });

  it('Should be true for BT file', () => {
    const result = utilities.isDownloadable('https://releases.ubuntu.com/20.04/ubuntu-20.04-desktop-amd64.iso.torrent');

    expect(result).to.be.true;
  });
});
