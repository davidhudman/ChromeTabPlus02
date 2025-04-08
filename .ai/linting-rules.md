# Linting and Formatting Rules

Consistent code formatting and linting improves code quality and makes it easier for AI tools to understand our codebase.

## Prettier Configuration

We use Prettier to enforce consistent formatting. Create a `.prettierrc` file with these settings:

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "quoteProps": "as-needed",
  "jsxSingleQuote": false,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### Key Formatting Principles

- Consistent indentation (2 spaces)
- Single quotes for strings (except JSX)
- Semicolons at the end of statements
- Trailing commas for multi-line lists
- 100 character maximum line length

## ESLint Configuration

Our ESLint setup enforces best practices and catches common errors. Create an `.eslintrc.js` file:

```javascript
module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:react/recommended", // If using React
    "plugin:@typescript-eslint/recommended", // If using TypeScript
    "prettier", // Disables ESLint rules that conflict with Prettier
  ],
  plugins: ["import"],
  rules: {
    // Error prevention
    "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-alert": "warn",

    // AI-friendly code structure
    complexity: ["warn", 10], // Cyclomatic complexity limit
    "max-depth": ["warn", 3], // Nesting depth
    "max-lines-per-function": ["warn", 30],
    "max-params": ["warn", 4],

    // Import organization
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
        ],
        "newlines-between": "always",
        alphabetize: { order: "asc" },
      },
    ],

    // Code clarity
    "prefer-const": "error",
    "no-var": "error",
  },
  settings: {
    react: {
      version: "detect", // If using React
    },
  },
};
```

## VSCode Configuration

Add these settings to your `.vscode/settings.json` file:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

## Chrome Extension Specific

For Chrome extensions, add these ESLint rules:

```javascript
"no-restricted-globals": ["error", "chrome"],
"browser-extensions/no-unsupported-features": "error",
```

## Pre-commit Hooks

Use Husky and lint-staged to enforce linting on commit:

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

## Why These Rules Help AI

1. **Predictable formatting**: AI models can better predict code structure
2. **Limited complexity**: Simpler code is easier for AI to understand
3. **Standard patterns**: Enforces patterns that AI is more likely to learn from common codebases
4. **Self-documenting code**: Rules that encourage descriptive names help AI understand intent
5. **Import organization**: Clear module boundaries help AI understand code structure
