// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { Alert } from "antd";

import { useTranslation } from "react-i18next";

export function StatusPage(): JSX.Element {
  const { t } = useTranslation();

  return <Alert type="error" message={t("status")} />;
}
