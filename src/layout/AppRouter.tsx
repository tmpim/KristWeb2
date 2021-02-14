import React from "react";
import { Switch, Route } from "react-router-dom";

import { DashboardPage } from "../pages/DashboardPage";

import { SettingsPage } from "../pages/settings/SettingsPage";
import { SettingsTranslations } from "../pages/settings/SettingsTranslations";

import { CreditsPage } from "../pages/credits/CreditsPage";

interface AppRoute {
  path: string;
  name: string;
  component?: React.ReactNode;
}

export const APP_ROUTES: AppRoute[] = [
  { path: "/", name: "dashboard", component: <DashboardPage /> },

  { path: "/settings",                    name: "settings", component: <SettingsPage /> },
  { path: "/settings/debug",              name: "settingsDebug" },
  { path: "/settings/debug/translations", name: "settings", component: <SettingsTranslations /> },

  { path: "/credits", name: "credits", component: <CreditsPage /> },
];

export function AppRouter(): JSX.Element {
  return <Switch>
    {APP_ROUTES.map(({ path, component }, key) => (
      component && <Route exact path={path} key={key}>{component}</Route>
    ))}

    <Route path="*">Not found</Route>
  </Switch>;
}
