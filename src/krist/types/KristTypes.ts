export type KristAddressName = string;
export type DateString = string;

export interface KristBlock {
  height: number;
  address: KristAddressName;
  hash: string;
  short_hash: string;
  value: number;
  time: DateString;
}

export interface KristAddress {
  address: string;
  balance: number;
  firstseen: DateString;
}