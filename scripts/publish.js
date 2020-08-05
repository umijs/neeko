const shell = require('shelljs');
const { version } = require('../package.json');
const push = require('./_push');

try {
  const tag = (version.match(/[a-z]+/) || ['latest'])[0];
  shell.exec(`npm publish dist --tag ${tag} --registry https://registry.npmjs.org`);

  push();
} catch (error) {
  console.error('publish error', error);
  process.exit(1);
}
