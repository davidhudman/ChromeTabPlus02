# Code Style and Formatting

Consistent code style and formatting improves readability and makes it easier for AI tools to understand and generate compatible code.

## General Principles

1. **Consistency**: Follow established patterns in the codebase
2. **Readability**: Optimize for human and AI readability, not conciseness
3. **Simplicity**: Prefer simple, direct approaches over clever solutions
4. **Explicitness**: Make intent clear through code structure and naming

## Naming Conventions

### Variables and Functions

- Use camelCase for variables and functions
- Use descriptive names that convey purpose
- Avoid abbreviations unless very common (e.g., `id`, `url`)
- Boolean variables should be prefixed with `is`, `has`, or `should`

```javascript
// Good
const isUserLoggedIn = true;
const fetchUserProfile = async (userId) => {
  /* ... */
};

// Avoid
const loggedIn = true;
const getProf = async (id) => {
  /* ... */
};
```

### Classes and Components

- Use PascalCase for classes and React components
- Use nouns for classes and objects
- Add common suffixes for specific types:
  - `...Manager` for classes that manage state
  - `...Controller` for classes that coordinate activities
  - `...Service` for classes providing external services

```javascript
// Good
class TodoManager {
  /* ... */
}
function UserProfile() {
  /* ... */
}
```

### Constants

- Use UPPER_SNAKE_CASE for constants
- Group related constants in objects

```javascript
// Good
const MAX_ATTEMPTS = 3;
const ErrorTypes = {
  NETWORK_ERROR: "network_error",
  VALIDATION_ERROR: "validation_error",
};
```

## Formatting

- 2 space indentation
- Maximum line length of 100 characters
- Use parentheses to clarify complex expressions
- Add spaces around operators
- Use trailing commas in multi-line arrays and objects

```javascript
// Good
const userData = {
  firstName: "John",
  lastName: "Doe",
  isActive: true,
};

// Good
const isEligible = user.age >= 18 && (user.isVerified || user.hasLegacyAccess);
```

## Code Organization

### File Organization

- One primary export per file
- Group related functions together
- Imports at the top, followed by constants, functions, and exports
- Sort imports: built-in modules, external packages, internal modules

### Function Organization

- Keep functions small and focused (under 30 lines)
- Place helper functions after the main function
- Follow a clear flow: input validation → processing → output

## Comments and Documentation

- Add comments to explain "why", not "what"
- Use JSDoc for public API functions
- Add section comments to delineate major parts of a file

```javascript
/**
 * Fetches user data and formats it for display.
 *
 * @param {string} userId - The unique identifier for the user
 * @returns {Promise<Object>} The formatted user data
 */
async function fetchUserForDisplay(userId) {
  // Implementation
}

// SECTION: Private helpers
// ----------------------------------------------------------------

// Internal function to normalize user data from different sources
function normalizeUserData(rawData) {
  // Implementation
}
```

## JavaScript Specific Guidance

- Prefer `const` over `let`, avoid `var`
- Use object and array destructuring
- Use template literals for string interpolation
- Use async/await for asynchronous code
- Prefer explicit returns in functions

```javascript
// Good
const { name, age } = user;
const userGreeting = `Hello, ${name}!`;

// Good
async function loadUserData() {
  const response = await fetchUser();
  return response.data;
}
```

## Chrome Extension Specific

For our Chrome extension:

- Use module pattern to avoid polluting global namespace
- Be explicit when using Chrome APIs
- Prefer declarative over programmatic when possible
- Minimize content script footprint

## AI-Friendly Style Tips

1. **Explicit over implicit**: Spell out intentions clearly
2. **Standard patterns**: Use common JavaScript patterns
3. **Meaningful structure**: Organize code in a logical flow
4. **Descriptive naming**: Names should convey purpose and type
5. **Avoid deep nesting**: Extract nested logic into named functions
