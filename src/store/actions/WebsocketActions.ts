import { createAction } from "typesafe-actions";
import { WSConnectionState } from "../../krist/api/types";

import * as constants from "../constants";

export const setConnectionState = createAction(constants.CONNECTION_STATE)<WSConnectionState>();
