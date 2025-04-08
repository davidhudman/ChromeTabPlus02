# Testing Practices

Effective testing not only improves code quality but also provides examples and context for AI tools to understand component behavior and requirements.

## Testing Philosophy

- **Test behavior, not implementation**: Focus on what code does, not how it does it
- **Test at appropriate levels**: Unit, integration, and end-to-end tests each serve different purposes
- **Tests as documentation**: Tests demonstrate how components should be used

## Test Types

### Unit Tests

- Test individual functions and components in isolation
- Mock dependencies to focus on the unit under test
- Aim for high coverage of core logic
- Keep tests small and focused

### Integration Tests

- Test how multiple units work together
- Minimize mocking to test real interactions
- Focus on API boundaries and component integration points

### End-to-End Tests

- Test complete user flows
- Focus on critical paths and user journeys
- Augment with manual testing for UX issues

## Testing Chrome Extensions

For our Chrome extension:

1. **Unit test utility functions**: Pure JavaScript functions can be tested conventionally
2. **Content script testing**: Mock the DOM and browser APIs
3. **Background script testing**: Mock Chrome API using libraries like `sinon-chrome`
4. **Integration testing**: Use tools like Puppeteer to test the extension in a controlled browser
5. **Storage testing**: Test local/sync storage operations with mocks

## Test Structure

Follow the AAA pattern:

- **Arrange**: Set up test conditions
- **Act**: Perform the action being tested
- **Assert**: Verify the expected outcome

```javascript
describe("TodoManager", () => {
  it("should mark a todo as complete", () => {
    // Arrange
    const todoManager = new TodoManager();
    const todo = { id: "123", title: "Test", completed: false };
    todoManager.addTodo(todo);

    // Act
    todoManager.completeTodo("123");

    // Assert
    const updatedTodo = todoManager.getTodo("123");
    expect(updatedTodo.completed).toBe(true);
  });
});
```

## Test Coverage

- Aim for high coverage of core business logic (90%+)
- Balance coverage with test quality and maintenance cost
- Use test coverage reports to identify gaps
- Prioritize testing complex code and critical features

## Testing Tools

Recommended tools for our project:

- **Test Framework**: Jest
- **Browser Testing**: Puppeteer
- **Chrome API Mocking**: sinon-chrome
- **DOM Testing**: Testing Library

## AI-Friendly Testing Practices

These practices make it easier for AI to understand and generate tests:

1. **Descriptive test names**: `it('should calculate discount based on user tier')`
2. **Consistent test structure**: Follow the same patterns across the codebase
3. **Clear assertions**: Prefer explicit assertions that show intent
4. **Test data helpers**: Create helper functions that generate test data
5. **Complete test cases**: Test edge cases and failure conditions

## Mocking Best Practices

- Create reusable mock factories for common dependencies
- Prefer minimal mocks that simulate only needed behavior
- Document mock behavior for complex interactions
- Reset mocks between tests to prevent test pollution

## Test-Driven Development

When possible, follow TDD practices:

1. Write a failing test that defines the expected behavior
2. Implement minimal code to make the test pass
3. Refactor while keeping tests passing

This creates a clear specification that helps AI understand requirements.
