export function assert(
  condition: boolean,
  message: string
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}
export function padStart(
  str: string,
  length: number,
  padString: string,
) {
  while (str.length < length) {
      str = padString + str;
  }
  return str;
}

export function binaryToByte(bin: string) {
  return parseInt(bin, 2);
}

export function bytesToBinary(bytes: Uint8Array) {
  return Array.from(bytes).map(x => padStart(x.toString(2), 8, '0')).join('');
}
