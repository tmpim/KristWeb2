# KristWeb v2

**NOT YET READY FOR PRODUCTION.**

*This project is heavily under development. It is currently in the design 
stages, meaning there is **no useful functionality yet***.

Rewrite of the Krist Web Wallet, in React. This is a fully clientside Krist 
wallet that only needs to communicate to the Krist node itself. It securely 
saves wallets encrypted in your browser's Local Storage, so you don't have to 
type in wallet passwords ever again!

### Building

```
git clone https://github.com/tmpim/KristWeb2
cd KristWeb2
npm install
npm start # Run the development server
npm run build # Build the production files
```

### Contributing

As per tmpim convention, this project uses 
[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) as a
standard for commit messages.

### Providing host attribution

To provide hosting credits in the sidebar footer, create the file
`host.json` in the project root with the following contents:

```json
{
  "name": "Lemmmy",
  "url": "https://github.com/Lemmmy"
}
```

### Donate

If you like my work, and want to help me with this hobby project and many more
in the future, please consider supporting me on 
[Patreon](https://patreon.com/lemmmy).

### License

This project is licensed under the GPL v3 license. See LICENSE.txt for more.