import {
  sha,
  pbkdf2,
  randomBytes,
} from './crypto';
import {
  assert,
  padStart,
  bytesToBinary,
  binaryToByte,
} from './utils';

// Is japanese wordlist
const isJapanese = (wordlist: string[]) => wordlist[0] === '\u3042\u3044\u3053\u304f\u3057\u3093';

// Normalization replaces equivalent sequences of characters
// so that any two texts that are equivalent will be reduced
// to the same sequence of code points, called the normal form of the original text.
function nfkd(str: string) {
  if (typeof str !== 'string') throw new TypeError(`Invalid mnemonic type: ${typeof str}`);
  return str.normalize('NFKD');
}

function normalize(str: string) {
  const norm = nfkd(str);
  const words = norm.split(' ');
  if (![12, 15, 18, 21, 24].includes(words.length)) throw new Error('Invalid mnemonic');
  return { nfkd: norm, words };
}

function assertEntropy(entropy: Uint8Array) {
  assert(
    entropy instanceof Uint8Array &&
    [16, 20, 24, 28, 32].includes(entropy.length),
    'Invalid entropy'
  );
}

/**
 * Generate mnemonic. Uses Cryptographically-Secure Random Number Generator.
 * @param wordlist imported wordlist for specific language
 * @param strength mnemonic strength 128-256 bits
 * @example
 * generateMnemonic(wordlist, 128)
 * // 'bunker expand insane mean adapt throw focus business network among cruel tomato'
 */
export async function generateMnemonic(wordlist: string[], strength: number = 128): Promise<string> {
  assert(
    Number.isSafeInteger(strength) &&
    strength > 0 &&
    strength <= 256 &&
    strength % 32 === 0,
    'Invalid strength'
  );
  return entropyToMnemonic(randomBytes(strength / 8), wordlist);
}

async function deriveChecksumBits(entropy: Uint8Array) {
  const ENT = entropy.length * 8;
  const CS = ENT / 32;
  const hash = await sha('SHA-256', entropy);
  return bytesToBinary(hash).slice(0, CS);
}

/**
 * Converts mnemonic string to raw entropy in form of byte array.
 * @param mnemonic 12-24 words
 * @param wordlist imported wordlist for specific language
 * @return entropy
 * @example
 * const mnem = 'legal winner thank year wave sausage worth useful legal winner thank yellow';
 * await mnemonicToEntropy(mnem, wordlist)
 * // Produces
 * new Uint8Array([
 *   0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f,
 *   0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f
 * ])
 */
export async function mnemonicToEntropy(mnemonic: string, wordlist: string[]): Promise<Uint8Array> {
  const { words } = normalize(mnemonic);
  assert(
    words.length % 3 === 0,
    'Invalid mnemonic'
  );
  // convert word indices to 11 bit binary strings
  const bits = words
    .map((word) => {
      const index = wordlist.indexOf(word);
      assert(
        index !== -1,
        'Invalid mnemonic'
      );
      return padStart(index.toString(2), 11, '0');
    })
    .join('');
  // split the binary string into ENT/CS
  const dividerIndex = Math.floor(bits.length / 33) * 32;
  const entropyBits = bits.slice(0, dividerIndex);
  const checksumBits = bits.slice(dividerIndex);
  // calculate the checksum and compare
  const entropy = new Uint8Array(entropyBits.match(/(.{1,8})/g)!.map(binaryToByte));
  assertEntropy(entropy);
  const newChecksum = await deriveChecksumBits(entropy);
  assert(
    newChecksum === checksumBits,
    'Invalid checksum'
  );

  return entropy;
}

/**
 * Converts raw entropy in form of byte array to mnemonic string.
 * @param entropy byte array
 * @param wordlist imported wordlist for specific language
 * @returns 12-24 words
 * @example
 * const ent = new Uint8Array([
 *   0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f,
 *   0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f
 * ]);
 * await entropyToMnemonic(ent, wordlist);
 * // 'legal winner thank year wave sausage worth useful legal winner thank yellow'
 */
export async function entropyToMnemonic(entropy: Uint8Array, wordlist: string[]): Promise<string> {
  assertEntropy(entropy);
  const entropyBits = bytesToBinary(entropy);
  const checksumBits = await deriveChecksumBits(entropy);
  const bits = entropyBits + checksumBits;
  const chunks = bits.match(/(.{1,11})/g)!;
  const words = chunks.map((binary) => {
    const index = binaryToByte(binary);
    return wordlist[index];
  });
  return words.join(isJapanese(wordlist) ? '\u3000' : ' ');
}

/**
 * Validates mnemonic for being 12-24 words contained in `wordlist`.
 */
export async function validateMnemonic(mnemonic: string, wordlist: string[]): Promise<boolean> {
  try {
    await mnemonicToEntropy(mnemonic, wordlist);
  } catch (e) {
    return false;
  }
  return true;
}

const salt = (passphrase: string) => nfkd(`mnemonic${passphrase}`);

/**
 * Uses KDF to derive 64 bytes of key data from mnemonic + optional password.
 * @param mnemonic 12-24 words
 * @param passphrase string that will additionally protect the key
 * @returns 64 bytes of key data
 * @example
 * const mnem = 'legal winner thank year wave sausage worth useful legal winner thank yellow';
 * await mnemonicToSeed(mnem, 'password');
 * // new Uint8Array([...64 bytes])
 */
export async function mnemonicToSeed(mnemonic: string, passphrase = '') {
  return pbkdf2(
    'SHA-512',
    normalize(mnemonic).nfkd,
    salt(passphrase),
    2048,
    64
  );
}
