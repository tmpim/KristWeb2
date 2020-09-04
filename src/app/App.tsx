import React from "react";
import "./App.scss";

import { MainLayout } from "../layouts/main";
import { kristService } from "@krist/KristConnectionService";

// TODO
kristService().connect("https://krist.ceriat.net")
  .catch(console.error);

export const App = (): JSX.Element => (
  <MainLayout />
);