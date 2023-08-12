# Web BIP39

JavaScript implementation of [Bitcoin BIP39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki): Mnemonic code for generating deterministic keys

Compared with most JavaScript implementations of BIP39, web-bip39:

* No external dependencies
* Only 8kb (lib<2kb> + wordlist<~6kb>) after gzip

web-bip39 depends on [Web Crypto](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) and other browser environment APIs, so it can only run in the browser environment.

## Playground
[Playground](https://hujiulong.github.io/web-bip39/)

## What is BIP39?
BIP39 describes the implementation of a mnemonic code or mnemonic sentence -- a group of easy to remember words -- for the generation of deterministic wallets.

For more info see the [BIP39 spec](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki).

## Installation
```bash
npm install web-bip39
```

## Usage
```js
import {
  generateMnemonic,
  mnemonicToEntropy,
  entropyToMnemonic,
  validateMnemonic,
  mnemonicToSeed
} from 'web-bip39';
import wordlist from 'web-bip39/wordlists/english';

// Generate a random mnemonic
const mnemonic = await generateMnemonic(wordlist);
// => 'crash lottery basket zero leg rice crunch force volcano toilet nasty baby'

// Uses KDF to derive 64 bytes of key data from mnemonic + optional password.
const seed = await mnemonicToSeed(mnemonic, 'password');
// => 'd5346e622570b6a82a182f694dd39c0108cad8e0c87936add0cb1a495b738a1896154100b0f479b3f03c236681076b1ef140ff303c95ddd3286b586f395b2d42'

// Converts mnemonic to entropy
const entropy = await mnemonicToEntropy(mnemonic, wordlist);

// Converts entropy to mnemonic
await entropyToMnemonic(entropy, wordlist);
// => 'crash lottery basket zero leg rice crunch force volcano toilet nasty baby'

// Validates mnemonic
const valid = await validateMnemonic(mnemonic, wordlist);
// => true
```

All wordlists:
```js
import wordlist from 'web-bip39/wordlists/chinese-simplified';
import wordlist from 'web-bip39/wordlists/chinese-traditional';
import wordlist from 'web-bip39/wordlists/czech';
import wordlist from 'web-bip39/wordlists/english';
import wordlist from 'web-bip39/wordlists/french';
import wordlist from 'web-bip39/wordlists/italian';
import wordlist from 'web-bip39/wordlists/japanese';
import wordlist from 'web-bip39/wordlists/korean';
import wordlist from 'web-bip39/wordlists/portuguese';
import wordlist from 'web-bip39/wordlists/spanish';
```

## Credits
The implementation of this module is inspired by the following projects:
* [bitcoinjs/bip39](https://github.com/bitcoinjs/bip39)
* [paulmillr/scure-bip39](https://github.com/paulmillr/scure-bip39)
* [iancoleman/bip39](https://github.com/iancoleman/bip39)

## License
[MIT](https://opensource.org/licenses/MIT)

Copyright (c) 2022-present, Jiulong Hu
