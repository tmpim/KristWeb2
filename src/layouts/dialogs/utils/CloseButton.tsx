import React from "react";

import Button from "react-bootstrap/Button";

type Props = {
  handleClose: () => void;
  alignRight?: boolean;
}

export const CloseButton: React.FC<Props> = ({ handleClose, alignRight }: Props) => (
  <Button 
    variant="secondary" 
    style={{ 
      marginRight: typeof alignRight === "undefined" || alignRight ? "auto" : "inherit" 
    }} 
    onClick={handleClose}
    tabIndex={1}
  >
    Close
  </Button>
);
