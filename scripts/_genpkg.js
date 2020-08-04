const shell = require('shelljs');
const path = require('path');
const pkg = require('../package.json');

module.exports = function() {
  process.chdir(path.resolve(__dirname, '..'));

  const { scripts, devDependencies, husky, ci, ...destPkg } = pkg;

  shell.exec(`echo '${JSON.stringify(destPkg)}' > dist/package.json`);
};
