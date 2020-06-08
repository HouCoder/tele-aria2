#!/usr/bin/env node
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var commander_1 = require("commander");
var winston_1 = __importDefault(require("winston"));
var Aria2_1 = __importDefault(require("./Aria2"));
var Telegram_1 = __importDefault(require("./Telegram"));
var packagePath = path_1.default.resolve(__dirname, '../package.json');
var packageJson = JSON.parse(fs_1.default.readFileSync(packagePath, 'utf-8'));
commander_1.program
    .version(packageJson.version)
    .option('-s, --aria2-server <aria2 server endpoint>', 'Aria2 server endpoint, e.g. ws://192.168.1.119:6800/jsonrpc')
    .option('-k, --aria2-key    <aria2 rpc key>', 'Aria2 server secret key')
    .option('-b, --tg-bot       <telegram bot key>', 'Telegram bot key')
    .option('-u, --tg-user      <telegram user id>', 'Telegram user ID, see here to get your ID - https://stackoverflow.com/a/32777943/4480674')
    .option('-p, --proxy        <proxy>', 'Access Telegram server through a proxy')
    .option('-m, --max-index    <maximum index>', 'Max items in the range of [1, max-index], default 20')
    .option('-c, --config       <config file path>', 'Load options from a JSON config file')
    .option('-V, --version', 'Output the current version')
    .option('-v, --verbose', 'Verbose output');
commander_1.program.parse(process.argv);
var options = __assign({}, commander_1.program.opts());
if (options.config) {
    // Load from config file.
    var configFileOptions = JSON.parse(fs_1.default.readFileSync(options.config, 'utf-8'));
    options = __assign(__assign({}, options), configFileOptions);
}
options.maxIndex = options.maxIndex ? Number(options.maxIndex) : 20;
options.tgUser = Number(options.tgUser);
var logger = winston_1.default.createLogger({
    level: options.verbose ? 'verbose' : 'info',
    format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
    }), winston_1.default.format.simple()),
    transports: [
        new winston_1.default.transports.Console(),
    ],
});
// Validate final options.
var requiredOptions = ['aria2Server', 'tgBot', 'tgUser'];
var validateErrors = [];
requiredOptions.forEach(function (requiredKey) {
    if (!options[requiredKey]) {
        validateErrors.push(requiredKey + " option is required!");
    }
});
if (validateErrors.length) {
    validateErrors.forEach(function (validateError) { return logger.error(validateError); });
    process.exit(1);
}
var aria2Server = new Aria2_1.default({
    endpoint: options.aria2Server,
    token: options.aria2Key,
    logger: logger,
});
new Telegram_1.default({
    aria2Server: aria2Server,
    tgBot: options.tgBot,
    tgUser: options.tgUser,
    proxy: options.proxy,
    maxIndex: options.maxIndex,
    logger: logger,
}).launch();
//# sourceMappingURL=run.js.map