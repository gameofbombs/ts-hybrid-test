const replaceError = (content) => {
  if (content.includes('tstree patched')) {
    return;
  }

  const from = 'function add(diagnostic) {';
  const to = 'function add(diagnostic) {' +
    '  if (diagnostic.code === 2694 || diagnostic.code === 2304 || diagnostic.code === 2339) {\n' +
    '    /* tstree patched */ return;\n' +
    '  }';

  return content
    .replace(from, to);
};

const targets = [
  'node_modules/typescript/lib/typescriptServices.js',
  'node_modules/typescript/lib/tsserver.js',
  'node_modules/typescript/lib/tsc.js',
  'node_modules/typescript/lib/tsserverlibrary.js',
  'node_modules/typescript/lib/typingsinstaller.js',
  'node_modules/typescript/lib/typescript.js',
];

const fs = require('fs');

targets.forEach(target => {
  let content = fs.readFileSync(target).toString();

  content = replaceError(content);

  fs.writeFileSync(target, content);
});
