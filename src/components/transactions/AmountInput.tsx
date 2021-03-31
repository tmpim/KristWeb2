// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { ReactNode } from "react";
import { Form, Input, InputNumber, Button } from "antd";

import { useTranslation } from "react-i18next";

import { useWallets } from "@wallets";
import { useCurrency } from "@utils/krist";

import { KristSymbol } from "@comp/krist/KristSymbol";

interface Props {
  from?: string;
  setAmount: (amount: number) => void;

  label?: ReactNode;
  required?: boolean;
  disabled?: boolean;

  tabIndex?: number;
}

export function AmountInput({
  from,
  setAmount,

  label,
  required,
  disabled,

  tabIndex,
  ...props
}: Props): JSX.Element {
  const { t } = useTranslation();

  // Used to populate 'Max'
  const { walletAddressMap } = useWallets();

  // Used to format the currency prefix/suffix
  const { currency_symbol } = useCurrency();

  function onClickMax() {
    if (!from) return;
    const currentWallet = walletAddressMap[from];
    setAmount(currentWallet?.balance || 0);
  }

  const amountRequired = required === undefined || !!required;

  return <Form.Item
    label={label}
    required={amountRequired}
    {...props}
  >
    <Input.Group compact style={{ display: "flex" }}>
      {/* Prepend the Krist symbol if possible. Note that ant's InputNumber
        * doesn't support addons, so this has to be done manually. */}
      {(currency_symbol || "KST") === "KST" && (
        <span className="ant-input-group-addon kw-fake-addon currency-prefix">
          <KristSymbol />
        </span>
      )}

      {/* Amount number input */}
      <Form.Item
        name="amount"
        style={{ flex: 1, marginBottom: 0 }}

        validateFirst
        rules={[
          { required: amountRequired,
            message: t("sendTransaction.errorAmountRequired") },
          { type: "number",
            message: t("sendTransaction.errorAmountNumber") },

          // Validate that the number isn't higher than the selected wallet's
          // balance, if it is present
          {
            async validator(_, value): Promise<void> {
              // If the field isn't required, don't complain if it's empty
              if (!required && typeof value !== "number")
                return;

              if (value < 1)
                throw t("sendTransaction.errorAmountTooLow");

              // Nothing to validate if there's no `from` field (request screen)
              if (!from) return;

              const currentWallet = walletAddressMap[from];
              if (!currentWallet) return;
              if (value > (currentWallet.balance || 0))
                throw t("sendTransaction.errorAmountTooHigh");
            }
          },
        ]}
      >
        <InputNumber
          type="number"
          min={1}
          style={{ width: "100%", height: 32 }}
          tabIndex={tabIndex}
          disabled={disabled}
        />
      </Form.Item>

      {/* Currency suffix */}
      <span className="ant-input-group-addon kw-fake-addon">
        {currency_symbol || "KST"}
      </span>

      {/* Max value button */}
      {from && <Button onClick={onClickMax} disabled={disabled}>
        {t("sendTransaction.buttonMax")}
      </Button>}
    </Input.Group>
  </Form.Item>;
}
