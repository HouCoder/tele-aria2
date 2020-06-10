import { SocksProxyAgent } from 'socks-proxy-agent';
import Telegraf, { Markup, Context } from 'telegraf';
import needle, { NeedleResponse } from 'needle';
import winston from 'winston';
import Aria2 from './Aria2';
import { TaskItem, aria2EventTypes } from './typings';
import {
  byte2Readable, getFilename, progress, getGidFromAction, isDownloadable,
} from './utilities';

export default class Telegram {
  private bot: Telegraf<Context>;

  private aria2Server: Aria2;

  private logger: winston.Logger;

  private allowedUser: number;

  private maxIndex: number;

  private agent: SocksProxyAgent | undefined;

  constructor(options: {
    tgBot: string;
    tgUser: number;
    proxy: string | undefined;
    aria2Server: Aria2;
    maxIndex: number;
    logger: winston.Logger;
  }) {
    this.allowedUser = options.tgUser;
    this.aria2Server = options.aria2Server;
    this.maxIndex = options.maxIndex;
    this.logger = options.logger;

    if (options.proxy) {
      this.agent = new SocksProxyAgent(options.proxy);
    }

    this.bot = this.connect2Tg({
      tgBot: options.tgBot,
    });

    this.registerAria2ServerEvents();
    this.authentication();
    this.onStart();
    this.onMessage();
    this.onAction();
  }

  private connect2Tg(tgSettings: {
    tgBot: string;
  }): Telegraf<Context> {
    let additionalOptions = {};

    if (this.agent) {
      additionalOptions = {
        telegram: {
          // https://github.com/telegraf/telegraf/issues/955
          agent: this.agent,
        },
      };
    }

    return new Telegraf(tgSettings.tgBot, additionalOptions);
  }

  private authentication(): void {
    this.bot.use((ctx, next) => {
      let incomingUserId;

      if (ctx.updateType === 'callback_query') {
        incomingUserId = ctx.update.callback_query?.from?.id;
      } else if (ctx.updateType === 'message') {
        incomingUserId = ctx.update.message?.from?.id;
      }

      if (incomingUserId && this.allowedUser === incomingUserId && next) {
        return next();
      }

      return ctx.reply('You\'re not allowed to use this bot 😢.');
    });
  }

  private replyOnAria2ServerEvent(event: aria2EventTypes, message: string): void {
    this.aria2Server.on(event, (params) => {
      if (params.length && params[0].gid) {
        const { gid } = params[0];

        // Get task name by gid
        this.aria2Server.send('tellStatus', [gid], (task) => {
          const fileName = getFilename(task) || gid;
          const fullMessage = `[${fileName}] ${message}`;

          // Broadcast the message!
          this.bot.telegram.sendMessage(this.allowedUser, fullMessage);
        });
      }
    });
  }

  private registerAria2ServerEvents(): void {
    // It happens when try to pause a pausing task.
    this.aria2Server.on('error', (error) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore This is a customized event, not easy to do it in the correct ts way.
      const message = `Error occured, code: ${error.code}, message: ${error.message}`;
      this.bot.telegram.sendMessage(this.allowedUser, message);
    });

    this.replyOnAria2ServerEvent('downloadStart', 'Download started!');
    this.replyOnAria2ServerEvent('downloadComplete', 'Download completed!');
    this.replyOnAria2ServerEvent('downloadPause', 'Download paused!');
    this.replyOnAria2ServerEvent('downloadError', 'Download error occured, please use the ✅Finished/Stopped menu to see the detail'); // Try to download some non-existing URL to triger this error. e.g. https://1992342346.xyz/qwq122312
    this.replyOnAria2ServerEvent('downloadStop', 'Download stopped!'); // Calling aria2.remove can triger this event.
  }

  private downloading(ctx: Context): void {
    this.aria2Server.send('tellActive', (data) => {
      if (Array.isArray(data)) {
        const parsed = data.map((item: TaskItem) => [
          `Name: ${getFilename(item)}`,
          `Progress: ${progress(Number(item.totalLength), Number(item.completedLength))}`,
          `Size: ${byte2Readable(Number(item.totalLength))}`,
          `Speed: ${byte2Readable(Number(item.downloadSpeed), '/s')}`,
        ].join('\n'));

        const message = parsed.join('\n\n') || 'No active download!';

        ctx.reply(message);
      }
    });
  }

  private waiting(ctx: Context): void {
    this.aria2Server.send('tellWaiting', [-1, this.maxIndex], (data) => {
      if (Array.isArray(data)) {
        const parsed = data.map((item: TaskItem) => [
          `Name: ${getFilename(item)}`,
          `Progress: ${progress(Number(item.totalLength), Number(item.completedLength))}`,
          `Size: ${byte2Readable(Number(item.totalLength))}`,
        ].join('\n'));

        const message = parsed.join('\n\n') || 'No waiting download!';

        ctx.reply(message);
      }
    });
  }

  private stopped(ctx: Context): void {
    this.aria2Server.send('tellStopped', [-1, this.maxIndex], (data) => {
      if (Array.isArray(data)) {
        const parsed = data.map((item: TaskItem) => {
          const messageEntities = [
            `Name: ${getFilename(item)}`,
            `Size: ${byte2Readable(Number(item.totalLength))}`,
            `Progress: ${progress(Number(item.totalLength), Number(item.completedLength))}`,
          ];

          if (item.errorMessage) {
            messageEntities.push(`Error: ${item.errorMessage}`);
          }

          return messageEntities.join('\n');
        });

        const message = parsed.join('\n\n') || 'No finished/stopped download!';

        ctx.reply(message);
      }
    });
  }

  private pause(ctx: Context): void {
    // List all active tasks
    this.aria2Server.send('tellActive', (data) => {
      if (!Array.isArray(data)) {
        return;
      }

      if (data.length === 0) {
        ctx.reply('No active task.');
      } else {
        // Build callback buttons.
        const buttons = data.map((item: TaskItem) => Markup.callbackButton(getFilename(item), `pause-task.${item.gid}`));

        ctx.replyWithMarkdown(
          'Which one to pause?',
          Markup.inlineKeyboard(buttons, { columns: 1 }).extra(),
        );
      }
    });
  }

  private resume(ctx: Context): void {
    // List all waiting tasks
    this.aria2Server.send('tellWaiting', [-1, this.maxIndex], (data) => {
      if (!Array.isArray(data)) {
        return;
      }

      if (data.length === 0) {
        ctx.reply('No waiting task.');
      } else {
        // Build callback buttons.
        const buttons = data.map((item: TaskItem) => Markup.callbackButton(getFilename(item), `resume-task.${item.gid}`));

        ctx.replyWithMarkdown(
          'Which one to resume?',
          Markup.inlineKeyboard(buttons, { columns: 1 }).extra(),
        );
      }
    });
  }

  private remove(ctx: Context): void {
    // List both waiting and active downloads
    const fullList: TaskItem[] = [];

    this.aria2Server.send('tellWaiting', [-1, this.maxIndex], (waitings) => {
      if (Array.isArray(waitings) && waitings.length) {
        fullList.push(...waitings);
      }

      this.aria2Server.send('tellActive', (actives) => {
        if (Array.isArray(actives) && actives.length) {
          fullList.push(...actives);
        }

        // Build callback buttons
        if (fullList.length === 0) {
          return ctx.reply('No task available.');
        }

        // Build callback buttons.
        const buttons = fullList.map((item: TaskItem) => Markup.callbackButton(getFilename(item), `remove-task.${item.gid}`));

        return ctx.replyWithMarkdown(
          'Which one to remove?',
          Markup.inlineKeyboard(buttons, { columns: 1 }).extra(),
        );
      });
    });
  }

  private generalAction(method: string, ctx: Context): void {
    const data = ctx.update.callback_query?.data;
    let gid = '';

    if (data) {
      gid = getGidFromAction(data);

      if (gid) {
        if (method === 'pause') {
          ctx.reply('Pausing a task can take a quite while, will notice you once it\'s done.');
        }

        this.aria2Server.send(method, [gid]);
      } else {
        this.logger.warn('No gid presented');
      }
    }
  }

  private onMessage(): void {
    this.bot.on('message', (ctx) => {
      const inComingText = ctx.update.message?.text;

      if (inComingText) {
        this.logger.info(`Received message from Telegram: ${inComingText}`);

        switch (inComingText) {
          case '⬇️Downloading':
            this.downloading(ctx);
            break;
          case '⌛️Waiting':
            this.waiting(ctx);
            break;
          case '✅Finished/Stopped':
            this.stopped(ctx);
            break;
          case '⏸️Pause a task':
            this.pause(ctx);
            break;
          case '▶️Resume a task':
            this.resume(ctx);
            break;
          case '❌Remove a task':
            this.remove(ctx);
            break;
          default:
            if (isDownloadable(inComingText)) {
              this.aria2Server.send('addUri', [[inComingText]]);
            } else {
              this.logger.warn(`Unable to a parse the request: ${inComingText}`);
            }
        }
      }

      const document = ctx.update.message?.document;

      // Receive BT file
      if (document && document.file_name && isDownloadable(document.file_name)) {
        this.logger.info(`Received BT file from Telegram: ${document.file_name}`);

        ctx.telegram.getFileLink(document.file_id)
          .then((url) => {
            // Download file
            // @ts-ignore - TODO: https://github.com/TooTallNate/node-socks-proxy-agent/issues/52
            needle.get(url, { agent: this.agent }, (error: Error, response: NeedleResponse) => {
              if (!error && response.statusCode === 200) {
                const base64EncodedTorrent = response.body.toString('base64');
                this.aria2Server.send('addTorrent', [base64EncodedTorrent]);
              }
            });
          });
      }
    });
  }

  private onAction(): void {
    // Match all actions
    this.bot.action(/.*/, (ctx) => {
      const data = ctx.update.callback_query?.data;

      if (!data) {
        return;
      }

      const actionName = data.split('.')[0];

      switch (actionName) {
        case 'pause-task':
          this.generalAction('pause', ctx);
          break;
        case 'resume-task':
          this.generalAction('unpause', ctx);
          break;
        case 'remove-task':
          this.generalAction('forceRemove', ctx);
          break;
        default:
          this.logger.warn(`No matched action for ${actionName}`);
      }
    });
  }

  private onStart(): void {
    this.bot.start((ctx) => {
      // Welcome message
      ctx.replyWithMarkdown(
        'Welcome to tele-aria2 bot! 👏',
        Markup.inlineKeyboard([
          Markup.urlButton('️GitHub Page', 'https://github.com/HouCoder/tele-aria2'),
          Markup.urlButton('Contact Author ', 'https://t.me/TonniHou'),
        ], { columns: 2 }).extra(),
      );

      // Keyboard
      ctx.replyWithMarkdown(
        'Please select an option',
        Markup.keyboard([
          '⬇️Downloading', '⌛️Waiting', '✅Finished/Stopped',
          '⏸️Pause a task', '▶️Resume a task', '❌Remove a task',
        ], { columns: 3 }).extra(),
      );
    });
  }

  launch(): void {
    this.bot.launch();
  }
}
