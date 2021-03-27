// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useMemo } from "react";

import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "@store";

import { Wallet, WalletNew, WalletMap, WalletFormatName, applyWalletFormat } from ".";
import { makeV2Address } from "../addressAlgo";

import { localeSort } from "@utils";

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

export type WalletAddressMap = Record<string, Wallet>;

export interface WalletsHookResponse {
  wallets: WalletMap;
  walletAddressMap: WalletAddressMap;

  addressList: string[];
  joinedAddressList: string;
}

/** Hook that fetches the wallets from the Redux store. */
export function useWallets(): WalletsHookResponse {
  const wallets = useSelector((s: RootState) => s.wallets.wallets, shallowEqual);

  const walletAddressMap: WalletAddressMap = {};
  const addressList: string[] = [];

  for (const id in wallets) {
    const wallet = wallets[id];
    const address = wallet.address;

    walletAddressMap[address] = wallet;

    // A cheap address list used for deep comparison. It's totally okay to
    // assume this list will only change when the addresses will change, as
    // since ES2015, object ordering is *basically* consistent:
    // https://stackoverflow.com/a/5525820/1499974
    // https://stackoverflow.com/a/38218582/1499974
    // https://stackoverflow.com/a/23202095/1499974
    addressList.push(address);
  }

  const joinedAddressList = addressList.join(",");

  return { wallets, walletAddressMap, addressList, joinedAddressList };
}

export interface WalletCategoriesHookResponse {
  categories: string[];
  joinedCategoryList: string;
}

export function useWalletCategories(): WalletCategoriesHookResponse {
  const wallets = useSelector((s: RootState) => s.wallets.wallets, shallowEqual);

  const categories = useMemo(() => {
    const cats = [...new Set(Object.values(wallets)
      .filter(w => w.category !== undefined && w.category !== "")
      .map(w => w.category) as string[])];
    localeSort(cats);
    return cats;
  }, [wallets]);

  const joinedCategoryList = categories.join(",");

  return { categories, joinedCategoryList };
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
