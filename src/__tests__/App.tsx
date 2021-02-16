import React from "react";
import { render, screen } from "@testing-library/react";
import App from "../App";

test("renders the app", async () => {
  render(<App />);

  const appLayout = await screen.findByTestId("site-app-layout");
  expect(appLayout).toBeInTheDocument();
});
