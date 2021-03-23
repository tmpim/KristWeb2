// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt

// This script adds the language codes from `languages.json` to LocaleContext,
// allowing the library locales (dayjs, timeago, antd) to be included in the
// build.

const { promises: fs } = require("fs");
const path = require("path");

const chalk = require("chalk");
const Diff = require("diff");

const languagesJSON = require("../src/__data__/languages.json");

function replaceLocales(src, localeType) {
  // Get the needed locale filenames for this library
  const locales = [...new Set(Object.values(languagesJSON)
    .map(l => l[localeType])
    .filter(l => !!l))];

  // Construct the regex to search for the locale magic comment. This looks like
  // `/* webpackInclude: /\b(LOCALE_TYPE|LOCALE|LOCALE|LOCALE|...)\.js$/ */`
  const searchRe = new RegExp(`(\\/\\* webpackInclude: \\/\\\\b\\(${localeType}\\|).+(\\)\\\\\\.js\\$\\/ \\*\\/)`);

  // Find and replace the magic comment, populating the new locales
  const localeList = locales.join("|");
  return src.replace(searchRe, "$1" + localeList + "$2");
}

async function main() {
  // Load the contents of LocaleContext
  const srcDir = path.resolve(__dirname, "../src/global");
  const srcFile = path.join(srcDir, "LocaleContext.tsx");

  let src = (await fs.readFile(srcFile)).toString();
  const originalSrc = src; // Used to diff at the end

  // Perform the magic comment replacements for each library
  src = replaceLocales(src, "dayjsLocale");
  src = replaceLocales(src, "timeagoLocale");
  src = replaceLocales(src, "antLocale");

  // Print the line-by-line diff
  const diff = Diff.diffLines(originalSrc, src);
  diff.forEach(part => {
    const colour = part.added ? chalk.green :
      part.removed ? chalk.red : chalk.grey;
    process.stderr.write(colour(part.value));
  });
  console.log();

  // Save the modified file
  await fs.writeFile(srcFile, src);
}

main()
  .then(() => console.log("Done!"))
  .catch(console.error);
