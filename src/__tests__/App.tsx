// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React from "react";
import { render, screen } from "@testing-library/react";
import App from "../App";

test("renders the app", async () => {
  render(<App />);

  const appLayout = await screen.findByTestId("site-app-layout");
  expect(appLayout).toBeInTheDocument();
});
