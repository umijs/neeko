const shell = require('shelljs');
const { version } = require('../package.json');

module.exports = function() {
  // 先打一个 tag
  shell.exec(`git tag ${version}`);

  shell.exec('git push origin $(git rev-parse --abbrev-ref HEAD)');
  shell.exec(`git push origin ${version}`);
};
