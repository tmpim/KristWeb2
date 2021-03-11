// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, useEffect } from "react";
import { Button } from "antd";

import { useTranslation } from "react-i18next";

import * as serviceWorker from "@utils/serviceWorkerRegistration";

import Debug from "debug";
const debug = Debug("kristweb:service-worker-check");

export function ServiceWorkerCheck(): JSX.Element | null {
  const { t } = useTranslation();

  const [showReload, setShowReload] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [loading, setLoading] = useState(false);

  function onUpdate(registration: ServiceWorkerRegistration) {
    setShowReload(true);
    setWaitingWorker(registration.waiting);
  }

  /** Force the service worker to update, wait for it to become active, then
   * reload the page. */
  function reloadPage() {
    setLoading(true);
    debug("emitting skipWaiting now");

    waitingWorker?.postMessage({ type: "SKIP_WAITING" });

    waitingWorker?.addEventListener("statechange", () => {
      debug("SW state changed to %s", waitingWorker?.state);

      if (waitingWorker?.state === "activated") {
        debug("reloading now!");
        window.location.reload();
      }
    });
  }

  // NOTE: The update checker is also responsible for registering the service
  //       worker in the first place.
  useEffect(() => {
    debug("registering service worker");
    serviceWorker.register({ onUpdate });
  }, []);

  return showReload ? (
    <div className="site-sidebar-header site-sidebar-update">
      <h5>{t("sidebar.updateTitle")}</h5>
      <p>{t("sidebar.updateDescription")}</p>

      <Button onClick={reloadPage} loading={loading}>
        {t("sidebar.updateReload")}
      </Button>
    </div>
  ) : null;
}
