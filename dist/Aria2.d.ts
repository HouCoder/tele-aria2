import winston from 'winston';
import { Aria2EventCallback, GeneralCallback, aria2EventTypes } from './typings';
export default class Aria2 {
    private connection;
    private token;
    private logger;
    private rpcQueue;
    private aria2Events;
    private callbackQueue;
    constructor(settings: {
        endpoint: string;
        token: string | undefined;
        logger: winston.Logger;
    });
    private regirsterWsEvents;
    private onWsOpen;
    private onWsMessage;
    private onWsError;
    private onWsClose;
    on(event: aria2EventTypes, callback: Aria2EventCallback): Aria2;
    send(method: string, customizedParams?: (string | number | string[])[] | GeneralCallback, callback?: GeneralCallback): Aria2;
}
