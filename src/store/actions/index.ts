// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import * as masterPasswordActions from "./MasterPasswordActions";
import * as walletsActions from "./WalletsActions";
import * as contactsActions from "./ContactsActions";
import * as settingsActions from "./SettingsActions";
import * as websocketActions from "./WebsocketActions";
import * as nodeActions from "./NodeActions";
import * as miscActions from "./MiscActions";

const RootAction = {
  masterPassword: masterPasswordActions,
  wallets: walletsActions,
  contacts: contactsActions,
  settings: settingsActions,
  websocket: websocketActions,
  node: nodeActions,
  misc: miscActions
};
export default RootAction;
