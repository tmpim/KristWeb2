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

export function selectContents(element: Element): void {
  const range = document.createRange();
  range.selectNodeContents(element);

  const selection = window.getSelection();
  if (!selection) throw new Error("Couldn't get window selection");
  selection.removeAllRanges();
  selection.addRange(range);
}

export const isLocalhost = Boolean(
  window.location.hostname === "localhost" ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === "[::1]" ||
    // 127.0.0.0/8 are considered localhost for IPv4.
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);
