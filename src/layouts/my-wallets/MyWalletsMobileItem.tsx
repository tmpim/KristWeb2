import React from "react";

import { useTranslation } from "react-i18next";

import { KristValue } from "@components/krist-value/KristValue";

import { Wallet } from "@/src/wallets/Wallet";

interface Props {
  item: Wallet
};

export const Separator: React.FC = () => 
  <span className="text-muted"> &ndash; </span>

export const MyWalletsMobileItem: React.FC<Props> = ({ item }: Props) => {
  const { t } = useTranslation();

  const formattedFirstSeen = item.firstSeen
    ? new Date(item.firstSeen).toLocaleString()
    : null;

  return <>
    <h4>
      {/* Show the balance on the right */}
      <KristValue className="float-right" value={item.balance} />

      {/* Show the label if it exists, otherwise show the address */}
      <span className="text-nowrap">
        {item.label ?? item.address}
      </span>
    </h4>
    <p className="mb-0">
      {/* Show the address if it has a label, otherwise this is unnecessary */}
      {item.label && <>
        {item.address}<Separator />
      </>}

      {/* Show the category if set */}
      {item.category && <>
        <span className="text-quiet">{item.category}</span><Separator />
      </>}

      {/* Show the name count */}
      <span className="text-quiet">
        {t("myWallets.nameCount", { count: item.names })}
      </span>

      {/* Show the first seen date and time on a new line if set */}
      {formattedFirstSeen && <>
        <br />
        <span className="text-muted">
          {t("myWallets.firstSeen", { date: formattedFirstSeen })}
        </span>
      </>}
    </p>
  </>
}
