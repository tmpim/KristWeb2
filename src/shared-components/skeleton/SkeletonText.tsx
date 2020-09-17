import React from "react";

import "./index.scss";

interface Props {
  emWidth?: number;
}

export const SkeletonText: React.FC<Props> = (props: Props) => (
  <div 
    className="skeleton skeleton-text"
    style={{
      width: props.emWidth ? `${props.emWidth}em` : undefined
    }}
  />
);
