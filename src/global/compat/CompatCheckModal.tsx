// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { Modal, Typography } from "antd";

import { CompatCheck } from ".";

import "./CompatCheckModal.less";

const { Text } = Typography;

interface Props {
  failedChecks: CompatCheck[];
}

function CompatCheckModalContent({ failedChecks }: Props): JSX.Element {
  // Note that this modal is not translated, as `fetch` is one of the APIs that
  // may be unavailable.

  return <>
    <p>Your browser is missing features required by KristWeb.
      <br />Please upgrade your web browser.</p>

    {/* Missing feature list */}
    <p>
      Missing feature{failedChecks.length > 1 && <>s</>}:&nbsp;
      {failedChecks.map((c, i, a) => (
        <span key={c.name} className="missing-feature">
          {c.url
            ? <a href={c.url} target="_blank" rel="noopener noreferrer">
              <Text type="danger">{c.name}</Text>
            </a>
            : <Text type="danger">{c.name}</Text>}

          {i < a.length - 1 && <>, </>}
        </span>
      ))}
    </p>

    <p>Please upgrade to the latest version of one of these recommended browsers:</p>

    {/* Browser choices */}
    <div className="browser-choices">
      <a href="https://www.google.com/chrome/" target="_blank" rel="noopener noreferrer">
        <img src="/img/google-chrome.svg" />
        Google Chrome
      </a>

      <a href="https://www.mozilla.org/en-GB/firefox/new/" target="_blank" rel="noopener noreferrer">
        <img src="/img/firefox.svg" />
        Mozilla Firefox
      </a>
    </div>
  </>;
}

export function openCompatCheckModal(failedChecks: CompatCheck[]): void {
  Modal.error({
    title: "Unsupported browser",

    width: 640,
    className: "compat-check-modal",

    okButtonProps: { style: { display: "none" }},
    closable: false,

    content: <CompatCheckModalContent failedChecks={failedChecks} />
  });
}
