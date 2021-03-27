// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import classNames from "classnames";
import { Typography } from "antd";

import { ConditionalLink } from "@comp/ConditionalLink";

import { useNameSuffix } from "@utils/currency";
import { useBooleanSetting } from "@utils/settings";

const { Text } = Typography;

interface OwnProps {
  name: string;
  text?: string;
  noLink?: boolean;
  neverCopyable?: boolean;
}
type Props = React.HTMLProps<HTMLSpanElement> & OwnProps;

export function KristNameLink({ name, text, noLink, neverCopyable, ...props }: Props): JSX.Element | null {
  const nameSuffix = useNameSuffix();
  const nameCopyButtons = useBooleanSetting("nameCopyButtons");
  const copyNameSuffixes = useBooleanSetting("copyNameSuffixes");

  if (!name) return null;
  const nameWithSuffix = `${name}.${nameSuffix}`;
  const content = text || nameWithSuffix;

  const copyable = !neverCopyable && nameCopyButtons
    ? { text: copyNameSuffixes ? nameWithSuffix : name }
    : undefined;

  const classes = classNames("krist-name", props.className);

  return <Text className={classes} copyable={copyable}>
    <ConditionalLink
      to={"/network/names/" + encodeURIComponent(name)}
      matchTo
      matchExact
      condition={!noLink}
    >
      {content}
    </ConditionalLink>
  </Text>;
}
