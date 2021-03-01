// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt

// Present a warning to the user warning about the dangers of Self-XSS.
// Shamelessly based on Facebook and Discord's warning.
//
// REVIEW: There's an interesting article debating whether a warning is the best
//         way forward. Since this is sort of a cryptocurrency app, and we deal
//         with far too many midiots on a daily basis, I figured that a
//         semi-aggressive warning is probably going to be better in the long
//         run. That said, this is still a pretty good read:
//         http://booktwo.org/notebook/welcome-js/
export function showConsoleWarning(): void {
  console.log("%cHold up!", "color: CornFlowerBlue; -webkit-text-stroke: 2px black; font-size: 72px; font-weight: bold;");
  console.log("%cDon't paste anything here!", "color: red; font-size: 18px; font-weight: bold;");
  console.log("%cThis console is a feature intended for developers. Pasting code in here may result in you getting scammed, and losing your Krist.", "font-size: 18px; font-weight: bold;");
  console.log("%cIf you know what you're doing, then please, carry on. Check out the GitHub: https://github.com/tmpim/KristWeb2", "font-size: 13px;");
}
