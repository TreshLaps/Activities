## Linting

1. Install ESLint extension i vscode
2. Add the following to vscode settings.json (File, Preferences, Settings) and restart vscode

```
"editor.codeActionsOnSave": {
  "source.fixAll.eslint": true
},
"editor.formatOnSave": false,
"eslint.validate": [
  "javascript",
  "javascriptreact",
  "typescript",
  "typescriptreact",
],
```