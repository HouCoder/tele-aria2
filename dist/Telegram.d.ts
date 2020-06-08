import winston from 'winston';
import Aria2 from './Aria2';
export default class Telegram {
    private bot;
    private aria2Server;
    private logger;
    private allowedUser;
    private maxIndex;
    private agent;
    constructor(options: {
        tgBot: string;
        tgUser: number;
        proxy: string | undefined;
        aria2Server: Aria2;
        maxIndex: number;
        logger: winston.Logger;
    });
    private connect2Tg;
    private authentication;
    private replyOnAria2ServerEvent;
    private registerAria2ServerEvents;
    private downloading;
    private waiting;
    private stopped;
    private pause;
    private resume;
    private remove;
    private generalAction;
    private onMessage;
    private onAction;
    private onStart;
    launch(): void;
}
