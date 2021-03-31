// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useTFns } from "@utils/i18n";

import { PageLayout } from "@layout/PageLayout";

import { RequestForm } from "./RequestForm";

import "./RequestPage.less";

export function RequestPage(): JSX.Element {
  const { tKey } = useTFns("request.");

  return <PageLayout
    className="request-page"
    titleKey={tKey("title")}
    siteTitleKey={tKey("siteTitle")}
  >
    <div className="request-container">
      <RequestForm />
    </div>
  </PageLayout>;
}
