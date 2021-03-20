// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt

import { useTranslation } from "react-i18next";

interface Props {
  description?: string;
  descriptionKey?: string;
}

export function SettingDescription({ description, descriptionKey }: Props): JSX.Element | null {
  const { t } = useTranslation();

  if (!description && !descriptionKey) return null;

  return (
    <div className="menu-item-description menu-item-setting-description">
      {descriptionKey ? t(descriptionKey) : description}
    </div>
  );
}
