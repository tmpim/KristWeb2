import React from "react";

import { useTranslation } from "react-i18next";

import Button from "react-bootstrap/Button";

interface Props {
  handleClose: () => void;
  alignRight?: boolean;
}

export const CloseButton: React.FC<Props> = ({ handleClose, alignRight }: Props) => {
  const { t } = useTranslation();

  return (
    <Button 
      variant="secondary" 
      style={{ 
        marginRight: typeof alignRight === "undefined" || alignRight ? "auto" : "inherit" 
      }} 
      onClick={handleClose}
      tabIndex={1}
    >
      {t("dialog.close")}
    </Button>
  );
};
