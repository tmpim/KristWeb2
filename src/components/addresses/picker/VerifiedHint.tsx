// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { VerifiedAddress, VerifiedAddressLink } from "@comp/addresses/VerifiedAddress";

interface Props {
  address: string;
  verified: VerifiedAddress;
}

export function VerifiedHint({ address, verified }: Props): JSX.Element {
  return <span className="address-picker-hint address-picker-verified-hint">
    <VerifiedAddressLink address={address} verified={verified} />
  </span>;
}
