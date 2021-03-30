// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { FC } from "react";
import { Alert } from "antd";

import { useTFns } from "@utils/i18n";

import * as Sentry from "@sentry/react";

interface Props {
  name: string;
}

export const ErrorBoundary: FC<Props> = ({ name, children }) => {
  return <Sentry.ErrorBoundary
    fallback={() => <ErrorFallback />}
    onError={console.error}

    // Add the boundary name to the scope
    beforeCapture={scope => {
      scope.setTag("error-boundary", name);
    }}
  >
    {children}
  </Sentry.ErrorBoundary>;
};

function ErrorFallback(): JSX.Element {
  const { tStr } = useTFns("errorBoundary.");

  return <Alert
    type="error"
    style={{ margin: 16 }}

    message={tStr("title")}
    description={<>
      <p>{tStr("description")}</p>

      {/* TODO: Hide this if Sentry is disabled */}
      <p style={{ marginBottom: 0}}>{tStr("sentryNote")}</p>
    </>}
  />;
}
