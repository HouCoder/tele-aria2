import { v4 as uuidv4 } from 'uuid';
import WebSocket from 'ws';
import winston from 'winston';
import {
  Aria2EventCallback, GeneralCallback, RequestParams,
  GeneralCallbacks, Aria2EventCallbacks, Aria2EventTypes,
} from './typings';

export default class Aria2 {
  private connection: WebSocket;

  private token: string | undefined;

  private logger: winston.Logger;

  private rpcQueue: RequestParams[] = [];

  private aria2Events: Aria2EventCallbacks = {};

  private callbackQueue: GeneralCallbacks = {};

  constructor(settings: {
    endpoint: string;
    token: string | undefined;
    logger: winston.Logger;
  }) {
    this.connection = new WebSocket(settings.endpoint);

    this.logger = settings.logger;

    if (settings.token) {
      this.token = settings.token;
    }

    this.regirsterWsEvents();
  }

  private regirsterWsEvents(): void {
    this.connection.on('open', () => {
      this.onWsOpen();
    });
    this.connection.on('message', (message: string) => {
      this.onWsMessage(message);
    });
    this.connection.on('error', this.onWsError);
    this.connection.on('close', this.onWsClose);
  }

  private onWsOpen(): void {
    this.logger.info('Websocket connection opened');

    while (this.rpcQueue.length) {
      const first: RequestParams | undefined = this.rpcQueue.shift();

      if (first !== undefined) {
        this.send(first.method, first?.params, first.callback);
      }
    }
  }

  private onWsMessage(message: string): void {
    const parsedMessage = JSON.parse(message);

    this.logger.info('Received message from Aria2 server');
    this.logger.verbose('Received message', parsedMessage);

    if (parsedMessage.error && this.aria2Events['aria2.onerror']) {
      this.aria2Events['aria2.onerror'](parsedMessage.error);
    } else if (this.callbackQueue[parsedMessage.id]) {
      // Request event callback.
      this.callbackQueue[parsedMessage.id](parsedMessage.result);

      // Remove the callback
      delete this.callbackQueue[parsedMessage.id];
    } else if (parsedMessage.method) {
      // Server event callback.
      const lowerCase = parsedMessage.method.toLowerCase();

      if (this.aria2Events[lowerCase]) {
        this.aria2Events[lowerCase](parsedMessage.params);
      }
    }
  }

  private onWsError(error: Error): void {
    this.logger.warn(error.message);
  }

  private onWsClose(): void {
    this.logger.info('Websocket connection closed');
  }

  on(event: Aria2EventTypes, callback: Aria2EventCallback): Aria2 {
    const fullEventName = `aria2.on${event.toLowerCase()}`;
    this.aria2Events[fullEventName] = callback;
    return this;
  }

  send(method: string,
    customizedParams?: (string|number|string[])[] | GeneralCallback,
    callback?: GeneralCallback): Aria2 {
    if (this.connection.readyState === WebSocket.OPEN) {
      const requestId = uuidv4();
      const requestParams: {
        jsonrpc: string;
        method: string;
        id: string;
        // Mixed types https://stackoverflow.com/a/29382420/4480674
        params: (string|number|string[])[];
      } = {
        jsonrpc: '2.0',
        method: `aria2.${method}`,
        id: requestId,
        params: [],
      };

      if (this.token) {
        requestParams.params.push(`token:${this.token}`);
      }

      if (customizedParams) {
        if (Array.isArray(customizedParams)) {
          requestParams.params.push(...customizedParams);
        } else {
          // Push callback to callbackQueue
          this.callbackQueue[requestId] = customizedParams;
        }
      }

      if (callback) {
        // Push callback to callbackQueue
        this.callbackQueue[requestId] = callback;
      }

      this.logger.info('Sending message to Aria2 server');
      this.logger.verbose('Message payload to Aria2 server', requestParams);
      this.connection.send(JSON.stringify(requestParams));
    } else {
      // Push task to rpcQueue
      this.rpcQueue.push({
        method,
        params: customizedParams,
        callback,
      });
    }

    return this;
  }
}
