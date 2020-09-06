export const sleep = (duration: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, duration));

export const toHex = (input: ArrayBufferLike | Uint8Array): string =>
  [...(input instanceof Uint8Array ? input : new Uint8Array(input))]
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

export const fromHex = (input: string): Uint8Array =>
  new Uint8Array((input.match(/.{1,2}/g) || []).map(b => parseInt(b, 16)));

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = (): void => {};
