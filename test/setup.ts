import util from 'util';
import { Crypto } from '@peculiar/webcrypto';

const crypto = new Crypto();

Object.defineProperty(window, 'crypto', {
  writable: true,
  value: crypto,
});

Object.defineProperty(window, 'TextEncoder', {
  writable: true,
  value: util.TextEncoder,
});

Object.defineProperty(window, 'TextDecoder', {
  writable: true,
  value: util.TextDecoder,
});
