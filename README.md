# @isyfact/prettier-plugin 

Shareable Prettier config for IsyFact projects.

## Install

Add this package and Prettier to your project:

```bash
npm install --save-dev prettier @isyfact/prettier-plugin
```
> Note: `prettier` is a peer dependency of this package — the consuming project must install a compatible Prettier version.

## Usage

Option A — package.json
```json
{
  "prettier": "@isyfact/prettier-plugin"
}
```

Option B — .prettierrc.js
```js
module.exports = require('@isyfact/prettier-plugin');
```

## CI / checks

Add a script to package.json of consuming projects:
```json
{
  "scripts": {
    "format": "prettier-isyfact --write .",
    "format:check": "prettier-isyfact --check ."
  }
}
```
The `prettier-isyfact` wrapper injects the package's default `.prettierignore` (node_modules/@isyfact/prettier-plugin/.prettierignore) unless you explicitly pass your own `--ignore-path`. 

If you prefer not to use the wrapper, you can reference the ignore file directly in your scripts:
```json
{
  "scripts": {
    "format": "prettier --write --ignore-path <your-path>/.prettierignore .",
    "format:check": "prettier --check --ignore-path <your-path>/.prettierignore ."
  }
}
```
