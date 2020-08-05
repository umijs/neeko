const shell = require('shelljs');
const { version } = require('../package.json');

module.exports = function() {
  // tag first
  shell.exec(`git tag ${version}`);

  shell.exec('git push origin $(git rev-parse --abbrev-ref HEAD)');
  shell.exec(`git push origin ${version}`);
};
