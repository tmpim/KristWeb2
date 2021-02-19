import * as walletManagerActions from "./WalletManagerActions";
import * as walletsActions from "./WalletsActions";
import * as settingsActions from "./SettingsActions";
import * as websocketActions from "./WebsocketActions";

const RootAction = {
  walletManager: walletManagerActions,
  wallets: walletsActions,
  settings: settingsActions,
  websocket: websocketActions
};
export default RootAction;
