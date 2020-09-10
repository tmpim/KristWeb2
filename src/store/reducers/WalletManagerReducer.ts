import { browseAsGuest, openLogin, login, setMasterPassword } from "@actions/WalletManagerActions";
import { createReducer, ActionType } from "typesafe-actions";

export interface State {
  /** Whether or not the user has logged in, either as a guest, or with a
   * master password. */
  readonly isLoggedIn: boolean;

  /** Whether or not the user is browsing KristWeb as a guest. */
  readonly isGuest: boolean;

  /** The master password used to encrypt and decrypt local storage data. */
  readonly masterPassword?: string;
  
  /** Secure random string that is encrypted with the master password to create
   * the "tester" string. */
  readonly salt?: string;
  /** The `salt` encrypted with the master password, to test the password is
   * correct. */
  readonly tester?: string;

  /** Whether or not the user has configured and saved a master password
   * before (whether or not salt+tester are present in local storage). */
  readonly hasMasterPassword: boolean;
}

// Salt and tester from local storage (or undefined)
const salt = localStorage.getItem("salt") || undefined;
const tester = localStorage.getItem("tester") || undefined;

// There is a master password configured if both `salt` and `tester` exist
const hasMasterPassword = !!salt && !!tester;

const initialState: State = {
  isLoggedIn: false,
  isGuest: true,

  salt, 
  tester,

  hasMasterPassword
};

export const WalletManagerReducer = createReducer(initialState)
  .handleAction(browseAsGuest, (state: State) => ({
    ...state,
    isLoggedIn: true,
    isGuest: true
  }))
  .handleAction(openLogin, (state: State) => ({
    ...state,
    isLoggedIn: false
  }))
  .handleAction(login, (state: State, action: ActionType<typeof login>) => ({
    ...state,
    isLoggedIn: true,
    isGuest: false,
    masterPassword: action.payload.password
  }))
  .handleAction(setMasterPassword, (state: State, action: ActionType<typeof setMasterPassword>) => ({
    ...state,
    isLoggedIn: true,
    isGuest: false,
    masterPassword: action.payload.password,
    salt: action.payload.salt,
    tester: action.payload.tester,
    hasMasterPassword: true
  }));
