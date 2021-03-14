# KristWeb v2

<table align="center">
  <tr>
    <td><img src="https://i.imgur.com/qBHn6Pz.png" width="360" /></td>
    <td><img src="https://i.imgur.com/DW86wns.png" width="360" /></td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <img src="https://i.imgur.com/PtineSx.png" width="480" />        
      <p align="center">
        <i>Dashboard design mockup</i>
      </p>
    </td>
  </tr>
</table>

<h2 align="center">STILL IN DEVELOPMENT</h2>

*This project is heavily under development. It is currently in the design 
stages, meaning there is **no useful functionality yet***.

Rewrite of the Krist Web Wallet, in React. This is a fully clientside Krist 
wallet that only needs to communicate to the Krist node itself. It securely 
saves wallets encrypted in your browser's Local Storage, so you don't have to 
type in wallet passwords ever again!

### Building (for development)

```sh
git clone https://github.com/tmpim/KristWeb2
cd KristWeb2

npm i -g pnpm # If you don't have pnpm, please use it for development

pnpm install
npm start # Run the development server
```

### Building (for production)

```sh
git clone https://github.com/tmpim/KristWeb2
cd KristWeb2
npm install
npm run full-build # Build the production files
```

### Contributing

As per tmpim convention, this project uses 
[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) as a
standard for commit messages.

### Contributing translations

Translation files are currently created manually in the 
[i18next JSON format](https://www.i18next.com/misc/json-format), with support 
for [JSON5 syntax](https://spec.json5.org/). You can find existing translations 
in [`public/locales`](public/locales). The 
[English (GB) translation](public/locales/en.json) is used as the fallback.

Language files are named with 
[IETF language tags](https://en.wikipedia.org/wiki/IETF_language_tag). Short
tags (e.g. `en` instead of `en-GB`) are preferred.

**IMPORTANT:** If you are adding a new language, you **must** add a listing for 
the language with the English name, native name, a country code (for the flag) 
and the contributors list to 
[`src/__data__/languages.json`](src/__data__/languages.json). It's not terribly
important, but the list should be kept in alphabetical order **by language 
code**.

The keys `antLocale`, `dayjsLocale` and `timeagoLocale` are all optional keys
that refer to the locale names from the respective libraries. If the library
does not support your language, create an issue on this repo or mention it in
your PR, because I can add a simple system to support custom translations for
these libraries if it is needed, though you should also PR to the libraries 
themselves.

List of supported locale codes for each library:

- `ant-design` - https://ant.design/docs/react/i18n
- `dayjs` - https://github.com/iamkun/dayjs/tree/dev/src/locale
- `react-timeago` - https://github.com/nmn/react-timeago/tree/master/src/language-strings

The library will automatically detect the language from your browser to use, but
for the sake of testing, you can override it by running the following command in
the developer console (<kbd>Ctrl+Shift+I</kbd>):

```js
localStorage.i18nextLng = "en";
```

If you need any help with specific i18next features (e.g. handling plurals),
don't hesitate to contact Lemmmy.

### Donate

If you like my work, and want to help me with this hobby project and many more
in the future, please consider [donating](https://donate.lemmmy.pw).

### License

**Copyright (c) 2020-2021 Drew Lemmy**

This project is licensed under the GPL v3 license. See LICENSE.txt for more.
