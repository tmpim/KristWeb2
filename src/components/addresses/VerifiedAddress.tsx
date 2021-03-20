// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import classNames from "classnames";
import { Row, Col, Card, Tooltip, Button, Typography } from "antd";
import { GlobalOutlined } from "@ant-design/icons";

import { useTranslation } from "react-i18next";

import verifiedAddressesJson from "../../__data__/verified-addresses.json";

import { ConditionalLink } from "@comp/ConditionalLink";
import { VerifiedCheck } from "./VerifiedCheck";

import Markdown from "markdown-to-jsx";
import { useMarkdownLink } from "@comp/krist/MarkdownLink";

const { Text } = Typography;

// A verified address is a service that transacts on behalf of its users, or
// holds a balance for its users, and is run by someone we think is trustworthy.

export interface VerifiedAddress {
  label: string;
  description?: string;
  website?: string;
  isActive?: boolean;
}

export type VerifiedAddresses = Record<string, VerifiedAddress>;
export const verifiedAddresses: VerifiedAddresses = verifiedAddressesJson;

export const getVerified = (address?: string | null): VerifiedAddress | undefined =>
  address ? verifiedAddresses[address] : undefined;

interface Props {
  address: string;
  verified: VerifiedAddress;
  parens?: boolean;
  className?: string;
}

export function VerifiedAddressLink({
  address,
  verified,
  parens,
  className
}: Props): JSX.Element {
  const classes = classNames("address-verified", className, {
    "address-verified-inactive": verified.isActive === false
  });

  return <span className={classes}>
    <Tooltip title={address}>
      <ConditionalLink
        to={"/network/addresses/" + encodeURIComponent(address)}
        matchTo
        matchExact
      >
        {parens && <>(</>}
        <span className="address-verified-label">
          {verified.label}
        </span>
        <VerifiedCheck />
        {parens && <>)</>}
      </ConditionalLink>
    </Tooltip>
  </span>;
}

export function VerifiedDescription({
  verified
}: { verified: VerifiedAddress }): JSX.Element {
  const { t } = useTranslation();

  // Make relative links start with the sync node, and override all links to
  // open in a new tab
  const MarkdownLink = useMarkdownLink();

  return <Row gutter={16} className="address-verified-description-row">
    <Col span={24}>
      <Card
        title={t("address.verifiedCardTitle")}
        className="kw-card address-verified-description"
      >
        {/* Description (markdown) */}
        {verified.description && <p>
          <Markdown options={{
            disableParsingRawHTML: true,
            overrides: { a: MarkdownLink }
          }}>
            {verified.description}
          </Markdown>
        </p>}

        {/* Inactive notice */}
        {verified.isActive === false && <div>
          <Text type={verified.description ? "secondary" : undefined}>
            {t("address.verifiedInactive")}
          </Text>
        </div>}

        {/* Website button */}
        {verified.website && <div style={{ marginTop: 16 }}>
          <a
            href={verified.website}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button type="primary">
              <GlobalOutlined /> {t("address.verifiedWebsiteButton")}
            </Button>
          </a>
        </div>}
      </Card>
    </Col>
  </Row>;
}
