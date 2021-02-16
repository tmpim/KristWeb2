import * as walletManagerActions from "./WalletManagerActions";
import * as walletsActions from "./WalletsActions";
import * as settingsActions from "./Settings";

const RootAction = {
  walletManager: walletManagerActions,
  wallets: walletsActions,
  settings: settingsActions,
};
export default RootAction;
