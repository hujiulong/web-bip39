import vectors from './vectors.json';
import customWordlist from './custom-wordlist.json';
import englishWordlist from '../src/wordlists/english.json';
import chineseSimplifiedWordlist from '../src/wordlists/chinese-simplified.json';
import japaneseWordlist from '../src/wordlists/japanese.json';
import {
  entropyToMnemonic,
  mnemonicToEntropy,
  mnemonicToSeed,
  validateMnemonic,
} from '../src';

const hexStringToU8Array = (hexString: string) =>
  Uint8Array.from(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));

const u8ArrayToHexString = (bytes: Uint8Array) =>
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

const WORDLISTS = {
  english: englishWordlist,
  custom: customWordlist,
  japanese: japaneseWordlist,
  'chinese-simplified': chineseSimplifiedWordlist,
}

Object.keys(vectors).forEach(name => {
  test(`test ${name} wordlist`, () => {
    const wordlist = WORDLISTS[name];
    return Promise.all(vectors[name].map(async data => {
      const valid = await validateMnemonic(data.mnemonic, wordlist);
      expect(valid).toBe(true);
  
      const mnemonic = await entropyToMnemonic(hexStringToU8Array(data.entropy), wordlist);
      expect(mnemonic).toBe(data.mnemonic);
  
      const entropy = await mnemonicToEntropy(mnemonic, wordlist);
      expect(u8ArrayToHexString(entropy)).toBe(data.entropy);
  
      const seed = await mnemonicToSeed(mnemonic, data.passphrase);
      expect(u8ArrayToHexString(seed)).toBe(data.seed);
    }))
  });
});
