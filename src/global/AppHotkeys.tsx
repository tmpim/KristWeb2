// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt

import { useHistory } from "react-router-dom";
import { GlobalHotKeys } from "react-hotkeys";

export function AppHotkeys(): JSX.Element {
  const history = useHistory();

  return <GlobalHotKeys
    keyMap={{ DEV_PAGE: ["up up d e v"] }}
    handlers={{
      DEV_PAGE: () => history.push("/dev")
    }}
  />;
}
