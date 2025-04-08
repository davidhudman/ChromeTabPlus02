# JavaScript Best Practices

This document outlines JavaScript best practices that make our code more maintainable and easier for AI assistants to understand and modify.

## General Principles

- **Clarity over cleverness**: Write code that's easy to understand, even if it's slightly more verbose
- **Consistency**: Follow the same patterns throughout the codebase
- **Explicitness**: Avoid magic values, implicit coercion, and other "magic" behavior

## Variables

- Use descriptive variable names that indicate purpose
- Prefer `const` by default, then `let` if needed; avoid `var`
- Initialize variables when they're declared
- Keep variable scope as narrow as possible

```javascript
// Good
const userCount = users.length;
let isUserLoggedIn = false;

// Avoid
const x = users.length;
var logged = false;
```

## Functions

- Keep functions small and focused (under 30 lines when possible)
- Use descriptive function names (verbs for actions, nouns for queries)
- Aim for functions to do just one thing
- Use explicit return statements

```javascript
// Good
function getUserDisplayName(user) {
  if (!user) return "Guest";
  return user.displayName || `${user.firstName} ${user.lastName}`;
}

// Avoid
function getName(u) {
  if (!u) return "Guest";
  return u.displayName || u.firstName + " " + u.lastName;
}
```

## Objects and Classes

- Use classes for complex objects with behavior
- Use plain objects for data structures
- Consider using TypeScript interfaces or JSDoc for object shapes
- Keep class methods small and focused

## Asynchronous Code

- Prefer async/await over Promise chains for readability
- Handle errors explicitly
- Provide meaningful error messages
- Be consistent with async patterns

```javascript
// Good
async function fetchUserData(userId) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching user:", error.message);
    throw error;
  }
}

// Avoid
function fetchUserData(userId) {
  return fetch(`/api/users/${userId}`)
    .then((res) => res.json())
    .catch((err) => console.log(err));
}
```

## Comments and Documentation

- Document the "why" rather than the "how"
- Use JSDoc comments for functions and classes
- Add comments for complex logic
- Keep comments up-to-date with code changes

```javascript
/**
 * Formats a user's name for display.
 * Falls back to first/last name if display name is not available.
 *
 * @param {Object} user - The user object
 * @param {string} [user.displayName] - The user's display name
 * @param {string} user.firstName - The user's first name
 * @param {string} user.lastName - The user's last name
 * @returns {string} The formatted display name
 */
function formatUserDisplayName(user) {
  return user.displayName || `${user.firstName} ${user.lastName}`;
}
```

## Chrome Extension Specific

- Use background/content-script/popup organization appropriately
- Avoid global state where possible
- Be explicit about message passing between extension components
- Properly handle permissions and user data

## AI-Friendly Patterns

- Provide type hints with JSDoc or TypeScript
- Break down complex operations into smaller, named steps
- Add brief comments before complex logic
- Use standard patterns over custom implementations
- Document any non-obvious design decisions
