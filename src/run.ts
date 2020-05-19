import fs from 'fs';
import { program } from 'commander';

import Aria2 from './Aria2';
import Telegram from './Telegram';

// Read package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

program
  .version(packageJson.version)
  .requiredOption('-s, --aria2-server <aria2 server endpoint>', 'aria2 server\'s endpoint, e.g. ws://192.168.1.119:6800/jsonrpc')
  .requiredOption('-b, --tg-bot       <telegram bot key>',      'your Telegram bot\'s key')
  .requiredOption('-u, --tg-user      <telegram user id>',      'your Telegram\'s user ID, see here to get your ID - https://stackoverflow.com/a/32777943/4480674')
  .option('-k, --aria2-key            <aria2 rpc key>',         'aria2 server\'s secret key')
  .option('-p, --tg-proxy             <proxy>',                 'access Telegram server through a proxy')
  .option('-m, --max-index            <maximum index>',         'max index', '20')
  .option('-V, --version',                                      'output the current version')
  .option('-v, --verbose',                                      'verbose output')

program.parse(process.argv);

const cliOptions = program.opts();

cliOptions.maxIndex = Number(cliOptions.maxIndex);
cliOptions.tgUser = Number(cliOptions.tgUser);

const aria2Server = new Aria2({
  endpoint: cliOptions.aria2Server,
  token: cliOptions.aria2Key,
});

new Telegram({
  aria2Server,
  tgBot: cliOptions.tgBot,
  tgUser: cliOptions.tgUser,
  proxy: cliOptions.tgProxy,
  maxIndex: cliOptions.maxIndex,
}).launch();
