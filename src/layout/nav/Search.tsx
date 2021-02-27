// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { useState } from "react";
import { AutoComplete, Input } from "antd";

import { useTranslation } from "react-i18next";

import { throttle } from "lodash-es";

import Debug from "debug";
const debug = Debug("kristweb:transactions-card");

const SEARCH_THROTTLE = 500;

export function Search(): JSX.Element {
  const { t } = useTranslation();

  const [value, setValue] = useState("");

  return <div className="site-header-search-container">
    <AutoComplete
      className="site-header-search"
      value={value}
      onChange={setValue}
    >
      <Input.Search placeholder={t("nav.search")} />
    </AutoComplete>
  </div>;
}
