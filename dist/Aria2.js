"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var uuid_1 = require("uuid");
var ws_1 = __importDefault(require("ws"));
var Aria2 = /** @class */ (function () {
    function Aria2(settings) {
        this.rpcQueue = [];
        this.aria2Events = {};
        this.callbackQueue = {};
        this.connection = new ws_1.default(settings.endpoint);
        this.logger = settings.logger;
        if (settings.token) {
            this.token = settings.token;
        }
        this.regirsterWsEvents();
    }
    Aria2.prototype.regirsterWsEvents = function () {
        var _this = this;
        this.connection.on('open', function () {
            _this.onWsOpen();
        });
        this.connection.on('message', function (message) {
            _this.onWsMessage(message);
        });
        this.connection.on('error', this.onWsError);
        this.connection.on('close', this.onWsClose);
    };
    Aria2.prototype.onWsOpen = function () {
        this.logger.info('Websocket connection opened');
        while (this.rpcQueue.length) {
            var first = this.rpcQueue.shift();
            if (first !== undefined) {
                this.send(first.method, first === null || first === void 0 ? void 0 : first.params, first.callback);
            }
        }
    };
    Aria2.prototype.onWsMessage = function (message) {
        var parsedMessage = JSON.parse(message);
        this.logger.info('Received message from Aria2 server');
        this.logger.verbose('Received message', parsedMessage);
        if (parsedMessage.error && this.aria2Events['aria2.onerror']) {
            this.aria2Events['aria2.onerror'](parsedMessage.error);
        }
        else if (this.callbackQueue[parsedMessage.id]) {
            // Request event callback.
            this.callbackQueue[parsedMessage.id](parsedMessage.result);
            // Remove the callback
            delete this.callbackQueue[parsedMessage.id];
        }
        else if (parsedMessage.method) {
            // Server event callback.
            var lowerCase = parsedMessage.method.toLowerCase();
            if (this.aria2Events[lowerCase]) {
                this.aria2Events[lowerCase](parsedMessage.params);
            }
        }
    };
    Aria2.prototype.onWsError = function (error) {
        this.logger.warn(error.message);
    };
    Aria2.prototype.onWsClose = function () {
        this.logger.info('Websocket connection closed');
    };
    Aria2.prototype.on = function (event, callback) {
        var fullEventName = "aria2.on" + event.toLowerCase();
        this.aria2Events[fullEventName] = callback;
        return this;
    };
    Aria2.prototype.send = function (method, customizedParams, callback) {
        var _a;
        if (this.connection.readyState === ws_1.default.OPEN) {
            var requestId = uuid_1.v4();
            var requestParams = {
                jsonrpc: '2.0',
                method: "aria2." + method,
                id: requestId,
                params: [],
            };
            if (this.token) {
                requestParams.params.push("token:" + this.token);
            }
            if (customizedParams) {
                if (Array.isArray(customizedParams)) {
                    (_a = requestParams.params).push.apply(_a, customizedParams);
                }
                else {
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
        }
        else {
            // Push task to rpcQueue
            this.rpcQueue.push({
                method: method,
                params: customizedParams,
                callback: callback,
            });
        }
        return this;
    };
    return Aria2;
}());
exports.default = Aria2;
//# sourceMappingURL=Aria2.js.map