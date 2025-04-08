# Environment Variables

This document outlines best practices for using environment variables in our codebase, with a focus on security, clarity, and AI-friendly patterns.

## General Principles

1. **Security**: Never commit sensitive values to source control
2. **Documentation**: Document all environment variables
3. **Defaults**: Provide sensible defaults where appropriate
4. **Validation**: Validate environment variables early in the application lifecycle

## Environment Variable Naming

Use a consistent naming convention:

- All uppercase with underscores (SNAKE_CASE)
- Prefix with application or component name for clarity
- Group related variables with common prefixes

```
# Good
CHROMETAB_API_KEY=abc123
CHROMETAB_API_URL=https://api.example.com
CHROMETAB_DEBUG_MODE=false

# Avoid
apiKey=abc123
url=https://api.example.com
```

## Chrome Extension Environment Variables

For Chrome extensions, environment variables can be handled in several ways:

1. **Build-time constants**: Replace placeholders during build
2. **Runtime configuration**: Store in a config file excluded from source control
3. **Extension storage**: For user-specific settings

### Build-time Variables (Using Webpack or similar)

```javascript
// webpack.config.js
const webpack = require("webpack");
require("dotenv").config();

module.exports = {
  // ... other webpack config
  plugins: [
    new webpack.DefinePlugin({
      "process.env.API_KEY": JSON.stringify(process.env.API_KEY),
      "process.env.DEBUG_MODE": JSON.stringify(process.env.DEBUG_MODE),
    }),
  ],
};
```

### Runtime Configuration

```javascript
// config.js - This file is in .gitignore
export const CONFIG = {
  API_KEY: "abc123",
  API_URL: "https://api.example.com",
  DEBUG_MODE: false,
};

// usage.js
import { CONFIG } from "./config";

function fetchData() {
  return fetch(`${CONFIG.API_URL}/data`, {
    headers: {
      Authorization: `Bearer ${CONFIG.API_KEY}`,
    },
  });
}
```

## Documentation

Create a `.env.example` file that documents all required and optional environment variables:

```
# API Configuration
CHROMETAB_API_KEY=your_api_key_here
CHROMETAB_API_URL=https://api.example.com

# Feature Flags
CHROMETAB_ENABLE_WEATHER=true
CHROMETAB_ENABLE_TODOS=true

# Debug Settings
CHROMETAB_DEBUG_MODE=false
CHROMETAB_LOG_LEVEL=info
```

## Loading Environment Variables

For local development, use a `.env` file with a tool like `dotenv`:

```javascript
// In a Node.js context (build scripts, etc)
require("dotenv").config();

// Access variables
const apiKey = process.env.CHROMETAB_API_KEY;
```

## Validation

Validate environment variables early in the application lifecycle:

```javascript
// validateEnv.js
function validateEnvironment() {
  const requiredVars = ["CHROMETAB_API_KEY", "CHROMETAB_API_URL"];

  const missing = requiredVars.filter((varName) => !process.env[varName]);

  if (missing.length) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  // Type/format validation
  if (
    process.env.CHROMETAB_LOG_LEVEL &&
    !["debug", "info", "warn", "error"].includes(
      process.env.CHROMETAB_LOG_LEVEL
    )
  ) {
    throw new Error(
      `Invalid LOG_LEVEL, must be one of: debug, info, warn, error`
    );
  }
}
```

## Environment-Specific Configuration

Use different environment variable sets for different environments:

- `.env.development`
- `.env.production`
- `.env.test`

## AI-Friendly Environment Variable Practices

1. **Explicit configuration objects**: Create a single configuration object instead of referencing `process.env` throughout the codebase
2. **Type validation**: Ensure variables are coerced to the correct types
3. **Default values**: Provide explicit fallbacks for optional variables
4. **Centralized access**: Use a configuration service to access environment values

```javascript
// config.js
export class ConfigService {
  // Get settings with type coercion and defaults
  static getString(key, defaultValue = "") {
    return process.env[key] || defaultValue;
  }

  static getNumber(key, defaultValue = 0) {
    const value = process.env[key];
    return value ? Number(value) : defaultValue;
  }

  static getBoolean(key, defaultValue = false) {
    const value = process.env[key];
    if (!value) return defaultValue;
    return ["true", "1", "yes"].includes(value.toLowerCase());
  }

  // Get all config as a single object
  static getConfig() {
    return {
      api: {
        key: this.getString("CHROMETAB_API_KEY"),
        url: this.getString("CHROMETAB_API_URL"),
      },
      features: {
        enableWeather: this.getBoolean("CHROMETAB_ENABLE_WEATHER", true),
        enableTodos: this.getBoolean("CHROMETAB_ENABLE_TODOS", true),
      },
      debug: {
        debugMode: this.getBoolean("CHROMETAB_DEBUG_MODE", false),
        logLevel: this.getString("CHROMETAB_LOG_LEVEL", "info"),
      },
    };
  }
}
```

This approach helps AI tools better understand the configuration schema and expected types.
