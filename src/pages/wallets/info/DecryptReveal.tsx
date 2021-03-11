// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, useEffect } from "react";
import classNames from "classnames";
import { Typography } from "antd";
import { CopyConfig } from "@comp/types";

import { useTranslation } from "react-i18next";

import { useMasterPassword } from "@wallets";

import { aesGcmDecrypt } from "@utils/crypto";
import { AuthorisedAction } from "@comp/auth/AuthorisedAction";

const { Text, Link } = Typography;

interface Props {
  value?: string;
  encrypted?: boolean;
  copyable?: boolean | CopyConfig;
  className?: string;
}

/** Hides a piece of data until a 'Reveal' link is clicked. If necessary, the
 * user will be prompted for their master password to decrypt the data. */
export function DecryptReveal({
  value,
  encrypted,
  copyable,
  className
}: Props): JSX.Element {
  const { t } = useTranslation();

  const { isAuthed, masterPassword } = useMasterPassword();

  const [revealed, setRevealed] = useState(false);
  const [decrypted, setDecrypted] = useState<string>();

  const reveal = () => setRevealed(true);

  useEffect(() => {
    if (!isAuthed || !masterPassword || !value || !revealed || decrypted)
      return;

    (async () => {
      const dec = await aesGcmDecrypt(value, masterPassword);
      setDecrypted(dec);
    })().catch(console.error);
  }, [isAuthed, masterPassword, value, revealed, decrypted]);

  function RevealedContents(): JSX.Element {
    return <>
      <Text className={classes} copyable={copyable}>
        {encrypted ? decrypted : value}
      </Text>

      {/* Hide link */}
      <Link
        onClick={() => setRevealed(false)}
        style={{ display: "inline-block", marginLeft: 8 }}
      >
        {t("myWallets.info.hideLink")}
      </Link>
    </>;
  }

  const canReveal = !encrypted || isAuthed;
  const revealLink = (
    <Link onClick={canReveal ? reveal : undefined}>
      {t("myWallets.info.revealLink")}
    </Link>
  );

  const classes = classNames("decrypt-reveal", className, {
    "decrypt-reveal-revealed": revealed,
    "decrypt-reveal-encrypted": encrypted,
    "decrypt-reveal-decrypted": !!decrypted,
  });

  return revealed
    ? <RevealedContents />
    : (encrypted
      ? <AuthorisedAction onAuthed={reveal}>{revealLink}</AuthorisedAction>
      : revealLink
    );
}
