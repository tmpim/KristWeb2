// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { Dispatch, SetStateAction } from "react";
import classNames from "classnames";
import { Modal } from "antd";

import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

interface Props {
  visible?: boolean;
  setVisible?: Dispatch<SetStateAction<boolean>>;
  className?: string;
}

export function NoWalletsModal({
  className,
  visible,
  setVisible
}: Props): JSX.Element {
  const { t } = useTranslation();
  const history = useHistory();

  const classes = classNames("kw-no-names-modal", className);

  return <Modal
    visible={visible}

    title={t("noNamesResult.title")}
    className={classes}

    onOk={() => {
      setVisible?.(false);
      history.push("/me/names");
    }}
    okText={t("noNamesResult.button")}

    onCancel={() => setVisible?.(false)}
    cancelText={t("dialog.cancel")}
  >
    {t("noNamesResult.subTitle")}
  </Modal>;
}
