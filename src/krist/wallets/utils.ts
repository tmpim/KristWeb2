// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "@store";

import { Wallet, WalletNew, WalletMap, WalletFormatName, applyWalletFormat } from ".";
import { makeV2Address } from "../addressAlgo";

export interface WalletsHookResponse {
  wallets: WalletMap;
  walletAddressMap: Record<string, Wallet>;

  addressList: string[];
  joinedAddressList: string;
}

/** Finds a wallet in the wallet map by the given Krist address. */
export function findWalletByAddress(
  wallets: WalletMap,
  address?: string
): Wallet | null {
  if (!address) return null;

  for (const id in wallets) {
    if (wallets[id].address === address) {
      return wallets[id];
    }
  }

  return null;
}

/** Hook that fetches the wallets from the Redux store. */
export function useWallets(): WalletsHookResponse {
  const wallets = useSelector((s: RootState) => s.wallets.wallets, shallowEqual);
  const walletAddressMap = Object.values(wallets)
    .reduce((o, wallet) => ({ ...o, [wallet.address]: wallet }), {});

  // A cheap address list used for deep comparison. It's totally okay to assume
  // this list will only change when the addresses will change, as since ES2015,
  // object ordering is _basically_ consistent:
  // https://stackoverflow.com/a/5525820/1499974
  // https://stackoverflow.com/a/38218582/1499974
  // https://stackoverflow.com/a/23202095/1499974
  const addressList = Object.keys(walletAddressMap);
  const joinedAddressList = addressList.join(",");

  return { wallets, walletAddressMap, addressList, joinedAddressList };
}

/** Almost anywhere you'd want to apply a wallet format, you'd also want to
 * calculate the v2 address, so just do both at once! */
export async function calculateAddress(
  addressPrefix: string,
  walletOrFormat: Wallet | WalletNew | WalletFormatName | undefined,
  password: string,
  username?: string
): Promise<{
  privatekey: string;
  address: string;
}> {
  if (walletOrFormat === undefined || typeof walletOrFormat === "string") {
    // We were passed a wallet format (or undefined, which is assumed to be
    // the default format, since it's not a Wallet instance)
    const format: WalletFormatName = walletOrFormat || "kristwallet";

    const privatekey = await applyWalletFormat(format || "kristwallet", password, username);
    const address = await makeV2Address(addressPrefix, privatekey);
    return { privatekey, address };
  } else {
    // We were passed a Wallet or WalletNew instance
    if (typeof walletOrFormat !== "object" || walletOrFormat === null)
      throw new Error("Missing `walletOrFormat` in `calculateAddress`!");

    const { format, username } = walletOrFormat as WalletNew;

    const privatekey = await applyWalletFormat(format || "kristwallet", password, username);
    const address = await makeV2Address(addressPrefix, privatekey);
    return { privatekey, address };
  }
}
