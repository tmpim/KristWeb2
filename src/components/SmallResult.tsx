/** This is ant-design's Result component, but without importing 54 kB of
 * images that we don't even use */

import React from "react";

import CheckCircleFilled from "@ant-design/icons/CheckCircleFilled";
import CloseCircleFilled from "@ant-design/icons/CloseCircleFilled";
import ExclamationCircleFilled from "@ant-design/icons/ExclamationCircleFilled";
import WarningFilled from "@ant-design/icons/WarningFilled";

export const IconMap = {
  success: CheckCircleFilled,
  error: CloseCircleFilled,
  info: ExclamationCircleFilled,
  warning: WarningFilled,
};
export type ResultStatusType = keyof typeof IconMap;

export interface ResultProps {
  icon?: React.ReactNode;
  status?: ResultStatusType;
  title?: React.ReactNode;
  subTitle?: React.ReactNode;
  extra?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Render icon if ExceptionStatus includes ,render svg image else render iconNode
 */
const renderIcon = ({ status, icon }: ResultProps) => {
  const iconNode = React.createElement(IconMap[status as ResultStatusType],);
  return <div className={"ant-result-icon"}>{icon || iconNode}</div>;
};

const renderExtra = ({ extra }: ResultProps) =>
  extra && <div className="ant-result-extra">{extra}</div>;

export const SmallResult: React.FC<ResultProps>  = ({
  className: customizeClassName,
  subTitle,
  title,
  style,
  children,
  status = "info",
  icon,
  extra,
}) => {
  return (
    <div className={"ant-result ant-result-" + status + " " + (customizeClassName || "")} style={style}>
      {renderIcon({ status, icon })}
      <div className="ant-result-title">{title}</div>
      {subTitle && <div className="ant-result-subtitle">{subTitle}</div>}
      {renderExtra({ extra })}
      {children && <div className="ant-result-content">{children}</div>}
    </div>
  );
};
