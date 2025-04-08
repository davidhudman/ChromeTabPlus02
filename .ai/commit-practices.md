# Commit Practices

Well-structured commits create a clear history of code changes that helps both humans and AI tools understand the evolution of the codebase.

## Commit Message Structure

Follow the Conventional Commits specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation changes
- **style**: Changes that don't affect code meaning (formatting, etc.)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvements
- **test**: Adding or correcting tests
- **chore**: Changes to build process or auxiliary tools

### Scope

Include an optional scope to specify what part of the codebase the commit affects:

```
feat(todo): add project organization feature
fix(background): prevent background reset on refresh
```

### Description

- Use imperative, present tense ("add" not "added")
- Don't capitalize the first letter
- No period at the end
- Keep it concise (under 50 characters)

### Body

- Use when additional explanation is needed
- Explain the "why" rather than the "how"
- Separate from subject with a blank line
- Wrap lines at 72 characters

### Footer

- Include references to issues or tickets
- Use `BREAKING CHANGE:` for breaking changes

## Commit Examples

```
feat(todos): add project organization feature

Implement project grouping for TODO items with:
- Project creation UI
- TODO assignment to projects
- Filtering TODOs by project

Closes #42
```

```
fix(background): prevent background reset on refresh

Store selected background in local storage instead of
sync storage to prevent loss on page refresh.

BREAKING CHANGE: background settings now use local storage
```

## Commit Size

- **Keep commits focused**: Each commit should contain related changes
- **Single responsibility**: Each commit should do one logical thing
- **Complete changes**: Don't leave the codebase in a broken state

## Commit Workflow

1. **Pull before commit**: Always pull the latest changes before committing
2. **Write tests first**: Add tests before implementing features
3. **Validate changes**: Run tests and linting before committing
4. **Review your changes**: Review the diff before committing

## Branch Strategy

- Use feature branches for new development
- Keep main/master branch stable and deployable
- Use descriptive branch names:
  - `feature/todo-projects`
  - `fix/background-reset`
  - `docs/readme-update`

## AI-Friendly Commit Practices

These practices help AI tools better understand code changes:

1. **Atomic commits**: Small, focused changes are easier to understand
2. **Descriptive messages**: Clearly explain the purpose of changes
3. **Consistent patterns**: Use the same format for similar types of changes
4. **Link to context**: Reference issues or documentation for more background
5. **Explain motivation**: Include the reason for changes, not just what changed

## Reviewing Commit History

When reviewing commit history:

- Look for patterns in related commits
- Use `git log --grep` to find specific changes
- Use `git blame` to understand when and why code changed

## Pre-Commit Hooks

Use pre-commit hooks to ensure quality:

- Run linting and formatting
- Run tests affected by changes
- Check commit message format
- Prevent committing debugging code
