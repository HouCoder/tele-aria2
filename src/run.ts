#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { program } from 'commander';
import winston from 'winston';
import { mergeWith, isString } from 'lodash';
import colors from 'colors/safe';

import Aria2 from './Aria2';
import Telegram from './Telegram';
import { UserOptions, RequiredOption } from './typings';

const packagePath = path.resolve(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));

/* eslint-disable no-multi-spaces, max-len */
program
  .version(packageJson.version)
  .option('-s, --aria2-server <aria2 server endpoint>', 'Aria2 server endpoint, e.g. ws://192.168.1.119:6800/jsonrpc')
  .option('-k, --aria2-key    <aria2 rpc key>',         'Aria2 server secret key')
  .option('-b, --bot-key      <telegram bot key>',      'Telegram bot key')
  .option('-u, --user-id      <telegram user id>',      'Telegram user ID, use `,` to separate multiple ids, see here to get your ID - https://stackoverflow.com/a/32777943/4480674')
  .option('-p, --proxy        <proxy>',                 'Access Telegram server through a HTTP proxy')
  .option('-m, --max-index    <maximum index>',         'Max items in the range of [1, max-index], default 20')
  .option('-c, --config       <config file path>',      'Load options from a JSON config file')
  .option('-V, --version',                              'Output the current version')
  .option('-v, --verbose',                              'Verbose output');
/* eslint-enable no-multi-spaces, max-len */

program.parse(process.argv);

const cliOptions = program.opts();

const { env } = process;
const envOptions = {
  aria2Server: env['ta.aria2-server'],
  aria2Key: env['ta.aria2-key'],
  botKey: env['ta.bot-key'],
  userId: env['ta.user-id'],
  proxy: env.https_proxy,
  maxIndex: env['ta.max-index'],
};

let configFileOptions;

if (cliOptions.config) {
  // Load from config file.
  const configFile = JSON.parse(fs.readFileSync(cliOptions.config, 'utf-8'));

  configFileOptions = {
    aria2Server: configFile['aria2-server'],
    aria2Key: configFile['aria2-key'],
    botKey: configFile['bot-key'],
    userId: configFile['user-id'],
    proxy: configFile.proxy,
    maxIndex: configFile['max-index'],
  };
}

// Combine options - https://stackoverflow.com/a/44034059
const options:UserOptions = mergeWith(
  {}, configFileOptions, envOptions, cliOptions,
  // https://github.com/airbnb/javascript/issues/752
  (a, b) => (b === null ? a : undefined),
);

let userId:number[] = [];

if (isString(options.userId) && options.userId.includes(',')) {
  userId = options.userId.split(',').map(Number);
}

options.maxIndex = options.maxIndex ? Number(options.maxIndex) : 20;

const logger = winston.createLogger({
  level: options.verbose ? 'verbose' : 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.simple(),
  ),
  transports: [
    new winston.transports.Console(),
  ],
});

logger.verbose('Received options', options);

// Validate final options.
const optionMapping = {
  aria2Server: 'aria2-server',
  botKey: 'bot-key',
  userId: 'user-id',
};
const requiredOptions: RequiredOption[] = ['aria2Server', 'botKey', 'userId'];
const validateErrors: string[] = [];

requiredOptions.forEach((requiredKey) => {
  if (!options[requiredKey]) {
    validateErrors.push(`${optionMapping[requiredKey]} option is required!`);
  }
});

if (validateErrors.length) {
  const notificationMessage = [
    '⚠️ 0.2.0 has changed configuration format,',
    'be sure to update your configurations if you are migrating from 0.1.0,',
    'visit https://github.com/HouCoder/tele-aria2 for more details',
  ].join(' ');

  console.log(colors.red(notificationMessage));
  validateErrors.forEach((validateError) => logger.error(validateError));

  process.exit(1);
}

const aria2Server = new Aria2({
  endpoint: options.aria2Server as string,
  token: options.aria2Key,
  logger,
});

new Telegram({
  aria2Server,
  botKey: options.botKey as string,
  userId,
  proxy: options.proxy,
  maxIndex: options.maxIndex,
  logger,
}).launch();
