const path = require('path');
const shell = require('shelljs');
const genpkg = require('./_genpkg');

function copyfiles() {
  process.chdir(path.resolve(__dirname, '..'));

  // copy es and cjs
  shell.cp('-R', 'es', 'dist');
  shell.cp('-R', 'lib', 'dist/cjs');

  shell.cp('*.md', 'dist');

  genpkg();
}

try {
  copyfiles();
} catch (error) {
  console.error('copyfiles error', error);
  process.exit(1);
}
