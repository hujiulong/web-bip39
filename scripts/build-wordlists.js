const glob = require('glob');
const path = require('path');
const fs = require('fs-extra');

const resolve = p => path.resolve(__dirname, '../', p);

// Manually generate the contents of JS files and declaration files for wordlists

fs.removeSync(resolve('wordlists'));
fs.ensureDir(resolve('wordlists'));

const wordlistFiles = glob.sync(path.resolve(__dirname, '../src/wordlists/*.json'));

wordlistFiles.forEach(file => {
  const content = fs.readFileSync(file).toString();
  const name = /\/([\w-]+)\.json$/.exec(file)[1];

  fs.copySync(file, resolve(`wordlists/${name}.json`));
  fs.writeFileSync(
    resolve(`wordlists/${name}.js`),
    `export default ${content};`,
  );
  fs.writeFileSync(
    resolve(`wordlists/${name}.d.ts`),
    `declare const wordlist: string[];
export default wordlist;`,
  );
});

