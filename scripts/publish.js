const shell = require('shelljs');
const { version } = require('../package.json');
const push = require('./_push');

try {
  const tag = (version.match(/[a-z]+/) || ['latest'])[0];
  shell.exec(`tnpm publish dist --tag ${tag}`);

  // 推到远程分支
  push();
} catch (error) {
  console.error('publish error', error);
  process.exit(1);
}
