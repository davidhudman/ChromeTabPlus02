# Documentation Standards

Good documentation is essential for both human developers and AI tools to understand code intent, design decisions, and usage patterns.

## Documentation Types

Our project uses these documentation types:

1. **README files**: General project information and getting started guides
2. **Code comments**: Explanations within the code
3. **JSDoc**: API documentation generated from code comments
4. **Markdown guides**: In-depth guides on specific topics

## README Documentation

Each repository and major directory should include a README.md file:

````markdown
# Component/Project Name

Brief description of the component or project.

## Features

- Feature 1: Brief description
- Feature 2: Brief description

## Installation

```bash
npm install
```
````

## Usage

```javascript
import { SomeComponent } from "./components";

// Example usage
const example = new SomeComponent({
  option1: "value",
});
```

## API Reference

[Link to API documentation]

## Contributing

[Link to contribution guidelines]

````

## Code Comments

Follow these principles for in-code documentation:

- **Intent comments**: Explain the "why" rather than the "what"
- **Complex logic**: Explain non-obvious algorithms or business rules
- **TODOs**: Mark items for future improvement with `// TODO: description`
- **Avoid obvious comments**: Don't restate what the code clearly shows

```javascript
// Good:
// Calculate the discount based on loyalty tier and purchase history
const discount = calculateDiscount(user, cart);

// Avoid:
// Set user's name to the firstName variable
const name = firstName;
````

## JSDoc Documentation

Use JSDoc for all public functions, classes, and interfaces:

```javascript
/**
 * Calculates the discount for a user's purchase.
 * Higher tier users receive larger discounts, with additional
 * bonuses for purchase history.
 *
 * @param {Object} user - The user object
 * @param {string} user.tier - The user's loyalty tier ('bronze', 'silver', 'gold')
 * @param {number} user.purchaseCount - Number of previous purchases
 * @param {Object} cart - The shopping cart object
 * @param {number} cart.subtotal - The pre-discount subtotal
 * @returns {number} The calculated discount amount
 */
function calculateDiscount(user, cart) {
  // Implementation
}
```

## Directory Documentation

Each major directory should include a README explaining:

1. The purpose of the module
2. Key components and their relationships
3. Usage examples
4. Design decisions or constraints

## AI-Friendly Documentation

To help AI tools better understand the codebase:

1. **Be explicit about types**: Use TypeScript or JSDoc type annotations
2. **Document expected behavior**: Include examples of correct usage
3. **Explain constraints**: Note performance considerations, edge cases
4. **Cross-reference**: Link related components or concepts
5. **Document patterns**: Highlight recurring design patterns

## Chrome Extension Documentation

For our Chrome extension, include:

1. **Permission explanations**: Document why each permission is needed
2. **Content script behavior**: Explain how content scripts interact with pages
3. **Storage usage**: Document what's stored and why
4. **Message passing**: Document communication between extension components

## Keeping Documentation Updated

- Review documentation when making code changes
- Update JSDoc comments when function signatures change
- Remove outdated comments rather than leaving them incorrect
- Run documentation generation tools as part of CI process
