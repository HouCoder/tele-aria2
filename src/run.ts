#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { program } from 'commander';
import winston from 'winston';

import Aria2 from './Aria2';
import Telegram from './Telegram';
import { UserOptions, requiredOption } from './typings';

const packagePath = path.resolve(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));

program
  .version(packageJson.version)
  .option('-s, --aria2-server <aria2 server endpoint>', 'Aria2 server endpoint, e.g. ws://192.168.1.119:6800/jsonrpc')
  .option('-k, --aria2-key    <aria2 rpc key>', 'Aria2 server secret key')
  .option('-b, --tg-bot       <telegram bot key>', 'Telegram bot key')
  .option('-u, --tg-user      <telegram user id>', 'Telegram user ID, see here to get your ID - https://stackoverflow.com/a/32777943/4480674')
  .option('-p, --proxy        <proxy>', 'Access Telegram server through a proxy')
  .option('-m, --max-index    <maximum index>', 'Max index, default 20')
  .option('-c, --config       <config file path>', 'Load options from a JSON config file')
  .option('-V, --version', 'Output the current version')
  .option('-v, --verbose', 'Verbose output');

program.parse(process.argv);

let options: UserOptions = { ...program.opts() };

if (options.config) {
  // Load from config file.
  const configFileOptions = JSON.parse(fs.readFileSync(options.config, 'utf-8'));

  options = { ...options, ...configFileOptions };
}

options.maxIndex = options.maxIndex ? Number(options.maxIndex) : 20;
options.tgUser = Number(options.tgUser);

const logger = winston.createLogger({
  level: options.verbose ? 'verbose' : 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console(),
  ],
});

// Validate final options.
const requiredOptions: requiredOption[] = ['aria2Server', 'tgBot', 'tgUser'];
const validateErrors: string[] = [];

requiredOptions.forEach((requiredKey) => {
  if (!options[requiredKey]) {
    validateErrors.push(`${requiredKey} option is required!`);
  }
});

if (validateErrors.length) {
  validateErrors.forEach(validateError => logger.error(validateError));

  process.exit(1);
}

const aria2Server = new Aria2({
  endpoint: options.aria2Server as string,
  token: options.aria2Key,
  logger,
});

new Telegram({
  aria2Server,
  tgBot: options.tgBot as string,
  tgUser: options.tgUser,
  proxy: options.proxy,
  maxIndex: options.maxIndex,
  logger,
}).launch();
