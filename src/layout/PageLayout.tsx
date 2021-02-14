import React, { FunctionComponent, useEffect } from "react";
import { useTranslation } from "react-i18next";

type Props = React.HTMLProps<HTMLDivElement> & {
  title?: string;
  titleKey?: string;
  className?: string;
}

export const PageLayout: FunctionComponent<Props> = ({ title, titleKey, className, children, ...rest }) => {
  const { t } = useTranslation();

  useEffect(() => {
    if      (title)    document.title = `${title} - KristWeb`;
    else if (titleKey) document.title = `${t(titleKey)} - KristWeb`;
  });

  // TODO: breadcrumbs and stuff

  return <div className={"page-layout " + (className || "")} {...rest}>{children}</div>
}
