import * as walletManagerActions from "./WalletManagerActions";
import * as walletsActions from "./WalletsActions";
import * as settingsActions from "./SettingsActions";
import * as websocketActions from "./WebsocketActions";
import * as nodeActions from "./NodeActions";

const RootAction = {
  walletManager: walletManagerActions,
  wallets: walletsActions,
  settings: settingsActions,
  websocket: websocketActions,
  node: nodeActions
};
export default RootAction;
