# File Size and Organization Guidelines

## File Size Limits

- **Maximum file size: 250 lines of code**
  - Files exceeding this limit should be refactored into smaller, more focused modules
  - This limit helps AI models maintain full context when generating or modifying code
  - Exceptions should be rare and documented in the file header

## Directory Structure

- Organize code by feature or domain rather than by file type
- Use clear, descriptive directory names
- Maintain a consistent depth of nesting (aim for no more than 3-4 levels deep)

## Module Organization

- Each module should have a clear, single responsibility
- Related functionality should be grouped together
- Export only what's necessary from each module

## Breaking Down Large Files

When a file approaches the 250-line limit:

1. Identify logical groupings of functionality
2. Extract each group into its own module
3. Import and use these modules in the original file
4. Consider creating an index file to re-export functionality if needed

### Example Refactoring

For our Chrome extension, consider breaking down `newTab.js` into:

```
src/
├── background/
│   ├── backgroundManager.js
│   └── backgroundControls.js
├── todos/
│   ├── todoManager.js
│   ├── todoRenderer.js
│   ├── projectManager.js
│   └── todoStorage.js
├── notes/
│   ├── notesManager.js
│   └── notesStorage.js
├── weather/
│   └── weatherService.js
└── ui/
    ├── timeDisplay.js
    └── notifications.js
```

## Guidelines for Imports

- Keep imports organized and grouped by:
  - External libraries
  - Internal modules
  - Relative imports
- Consider using barrel files (index.js) to simplify imports from complex directories

## Benefits for AI Assistance

- AI models can more easily understand the complete context of smaller files
- Focused modules with clear responsibilities are easier for AI to explain and modify
- Consistent organization patterns help AI suggest appropriate locations for new code
