import { sha256 } from "../../../utils/crypto";

export interface WalletFormat {
  (password: string, username?: string): Promise<string>;
}

export const KristWalletFormat: WalletFormat
  = async password => await sha256("KRISTWALLET" + password) + "-000";

export const APIFormat: WalletFormat
  = async password => password;

export type WalletFormatName = "kristwallet" | "api";
export const WalletFormatMap: Record<WalletFormatName, WalletFormat> = {
  "kristwallet": KristWalletFormat,
  "api": APIFormat
};
