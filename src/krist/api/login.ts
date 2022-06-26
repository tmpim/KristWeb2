import { TranslatedError } from "@utils/i18n";

import { store } from "@app";

import { decryptWallet, syncWallet, Wallet } from "@wallets";
import * as api from "@api";

export async function loginWallet(wallet: Wallet): Promise<void> {
  const masterPassword = store.getState().masterPassword.masterPassword;
  if (!masterPassword) throw new TranslatedError("myWallets.login.masterPasswordRequired");

  const decrypted = await decryptWallet(masterPassword, wallet);
  if (!decrypted) throw new TranslatedError("myWallets.login.errorWalletDecrypt");

  try {
    // Call /login to force create the address
    const { authed } = await api.post<LoginRes>("/login", {
      privatekey: decrypted.privatekey
    });
    if (!authed) throw new TranslatedError("myWallets.login.errorAuthFailed");

    // Fetch the updated address and store it in the Redux store
    syncWallet(wallet);
  } catch (e) {
    console.error(e);
    throw new TranslatedError("myWallets.login.errorAuthFailed");
  }
}

interface LoginRes {
  authed: boolean;
  address?: string;
}
