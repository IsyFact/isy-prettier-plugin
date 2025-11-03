# @isyfact/prettier-plugin 

Das Paket @isyfact/prettier-plugin enthält eine einheitliche Konfiguration zum Formatieren von TypeScript-Projekten in der IsyFact.

## Steckbrief
Das isy-prettier-plugin (Repository: https://github.com/IsyFact/isy-prettier-plugin) ist ein Prettier-Plugin, 
das IsyFact-spezifisch Formatierungsregeln und Konventionen zentralisiert und dadurch eine einheitliche Codebasis sicherstellt. 
Es erweitert bzw. ergänzt Prettier um vordefinierte Regeln und Presets, mit denen projektspezifische Stilvorgaben automatisch angewendet werden können.

## Getting Started

### Installation der NPM-Pakete

Füge das NPM-Paket zu deinem Projekt hinzu:

```bash
npm install --save-dev prettier @isyfact/prettier-plugin
```
> Hinweis: `Prettier` ist eine peer-dependency — Das Typescript-Projekt muss eine kompatible `Prettier` Version (> v3) installiert haben.

### Verwendung im Typescript-Projekt

Die Integration der IsyFact Prettier-Konfiguration kann auf unterschiedliche Weise erfolgen:

Option A — In der package.json
```json
{
  "prettier": "@isyfact/prettier-plugin"
}
```

Option B — Erstellen Sie eine Datei mit dem Namen .prettierrc.js und fügen Sie den folgenden Abschnitt hinzu:
```js
module.exports = require('@isyfact/prettier-plugin');
```

### Ausführung des Prettier-Checks
Füge das Script zur package.json hinzu:
```json
{
  "scripts": {
    "format": "prettier --write --ignore-path node_modules/@isyfact/prettier-plugin/.prettierignore .",
    "format:check": "prettier --check --ignore-path node_modules/@isyfact/prettier-plugin/.prettierignore ."
  }
}
```
> Hinweis: Dieses Skript verwendet die Standardkonfiguration der `.prettierignore` des isy-prettier-plugins. Wenn Sie Ihre eigene `.prettierignore` verwenden möchten, können Sie das Argument `--ignore-path` weglassen.
