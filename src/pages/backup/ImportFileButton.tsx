// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React from "react";
import { notification } from "antd";

import { useTFns } from "@utils/i18n";

import Debug from "debug";
const debug = Debug("kristweb:import-file-button");

interface Props {
  setCode: (code: string) => void;
}

export function ImportFileButton({
  setCode
}: Props): JSX.Element {
  const { tStr } = useTFns("import.");

  /** Updates the contents of the 'code' field with the given file. */
  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { files } = e.target;
    if (!files?.[0]) return;
    const file = files[0];

    debug("importing file %s", file.name);

    // Disallow non-plaintext files
    if (file.type !== "text/plain") {
      notification.error({
        message: tStr("fileErrorTitle"),
        description: tStr("fileErrorNotText")
      });
      return;
    }

    // Read the file and update the contents of the code field
    const reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = e => {
      if (!e.target || !e.target.result) {
        debug("reader.onload target was null?!", e);
        return;
      }

      const contents = e.target.result.toString();
      setCode(contents);
    };
  }

  return <div key="importFromFile" style={{ float: "left" }}>
    {/* Pretend to be an ant-design button (for some reason, nesting a
      * Button in a label just wouldn't work) */}
    <label htmlFor="import-backup-file" className="ant-btn">
      {/* I have no idea why verticalAlign has to be specified here */}
      <span style={{ verticalAlign: "middle" }}>
        {tStr("fromFileButton")}
      </span>
    </label>

    {/* ant-design's Upload/rc-upload was over 24 kB for this, and we
      * only use it for the most trivial functionality, so may as well
      * just use a bare component. It's okay that this input will
      * probably get re-rendered (and thus lose its value) every time
      * the state changes, as we only use it to update `code`'s state
      * immediately after a file is picked. */}
    <input
      id="import-backup-file"
      type="file"
      accept="text/plain"
      onChange={onFileChange}
      style={{ display: "none" }}
    />
  </div>;
}
