import React from "react";
import "./App.scss";

import { MainLayout } from "../layouts/main";
import { kristService } from "@krist/KristConnectionService";

import packageJson from "@/package.json";
// TODO
kristService().connect(packageJson.defaultSyncNode)
  .catch(console.error);

export const App = (): JSX.Element => (
  <MainLayout />
);
