import path from 'path';
import ts from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import fs from 'fs';

const resolve = p => path.resolve(__dirname, '../', p);

// clear dist
if (fs.existsSync(resolve('dist'))) {
  fs.rmdirSync(resolve('dist'), { recursive: true, force: true });
}

// ensure TS checks only once for each build
let hasTSChecked = false;

function createConfig(format, minifiy) {
  let fileNameSuffix = format;
  if (format === 'iife') {
    fileNameSuffix = 'global';
  } else if (format === 'es') {
    fileNameSuffix = 'esm';
  }

  const config = {
    input: resolve('src/index.ts'),
    plugins: [
      ts({
        check: !hasTSChecked,
        tsconfig: resolve('tsconfig.json'),
        cacheRoot: resolve('node_modules/.rts2_cache'),
        tsconfigOverride: {
          compilerOptions: {
            target: 'es5',
            sourceMap: false,
            declaration: !hasTSChecked,
            declarationMap: false,
          },
        }
      }),
      minifiy && terser({
        compress: {
          ecma: 5,
        },
      }),
    ].filter(Boolean),
    output: {
      sourcemap: false,
      name: format === 'iife' ? 'WebBip39' : undefined,
      file: resolve(`dist/web-bip39.${fileNameSuffix}${minifiy ? '.prod' : ''}.js`),
      format,
    }
  }

  hasTSChecked = true;

  return config;
}

export default [
  createConfig('es'),
  createConfig('es', true),
  createConfig('cjs'),
  createConfig('cjs', true),
  createConfig('iife'),
  createConfig('iife', true),
];

// const config = [
//   ...glob.sync(resolve('src/wordlists/*.json')).map(file => {
//     const wordlist = fs.readFileSync(file).toString();
//     const name = /\/([\w-]+)\.json$/.exec(file)[1];
//     return {
//       input: 'entry',
//       plugins: [
//         virtual({
//           'entry': `export default ${wordlist};`
//         }),
//         ...plugins,
//       ],
//       output: {
//         file: resolve(`dist/${name}.js`),
//         format: `es`
//       }
//     }
//   }),
//   {
//     input: resolve('src/index.ts'),
//     plugins: [
//       json(),
//       ts({
//         check: process.env.NODE_ENV === 'production' && !hasTSChecked,
//         tsconfig: resolve('tsconfig.json'),
//         cacheRoot: resolve('node_modules/.rts2_cache'),
//         tsconfigOverride: {
//           compilerOptions: {
//             target: 'es5',
//             sourceMap: false,
//             declaration: !hasTSChecked,
//             declarationMap: !hasTSChecked
//           },
//           exclude: ['**/__tests__', 'test-dts']
//         }
//       })
//     ],
//     output: {
//       file: resolve(`dist/web-bip39.esm.js`),
//       format: `es`
//     },
//   }
// ]

// console.log(config);

// export default config;