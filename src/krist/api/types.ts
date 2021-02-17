export interface KristAddress {
  address: string;

  balance: number;
  totalin?: number;
  totalout?: number;

  firstseen: string;
}

export type APIResponse<T extends Record<string, any>> = T & {
  ok: boolean;
  error?: string;
}
