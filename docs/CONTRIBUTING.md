# Contributing Guide

Thank you for your interest in contributing to Remotion MP4! This guide outlines the process for contributing to the project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Conventions](#coding-conventions)
- [Git Workflow](#git-workflow)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

## Getting Started

### Prerequisites

- Node.js 18+ with npm
- Git
- A code editor (VS Code recommended)

### Setting Up Development Environment

1. **Fork the repository**

   ```bash
   # Click "Fork" on GitHub, then:
   git clone https://github.com/YOUR_USERNAME/Remotion_mp4.git
   cd Remotion_mp4
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feat/your-feature-name
   ```

## Project Structure

```
Remotion_mp4/
├── apps/
│   └── studio/              # Remotion Studio application
├── packages/
│   ├── core/                # Shared types and utilities
│   ├── renderer/            # SSR rendering + CLI
│   ├── intake/              # AI code validation + scaffolding
│   ├── assets/              # Asset management
│   ├── animations-2d/       # 2D composition examples
│   └── animations-3d/       # 3D composition examples
├── docs/                    # Documentation
├── prompts/                 # AI code generation prompts
├── .github/
│   ├── workflows/           # GitHub Actions
│   ├── CODEOWNERS           # Code ownership rules
│   └── PULL_REQUEST_TEMPLATE.md
└── STATUS.md                # Project progress
```

## Coding Conventions

### TypeScript

- Use strict TypeScript mode
- Prefer `interface` over `type` for object shapes
- Avoid `any` - use `unknown` or proper types
- Use named exports by default

### Imports

Group imports in this order:

1. React imports
2. Third-party libraries
3. Internal packages
4. Types

```typescript
import React from 'react'
import { useState } from 'react'
import { Composition } from 'remotion'
import { useVideoConfig } from '@remotion-mp4/core'
import { MyComponentProps } from './MyComponent.types'
```

### File Naming

- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Types: `PascalCase.types.ts`
- Hooks: `useCamelCase.ts`

### Component Structure

```tsx
import React from 'react'

interface ComponentProps {
  propOne: string
  propTwo?: number
}

export const ComponentName: React.FC<ComponentProps> = ({ propOne, propTwo = 10 }) => {
  return <div>{/* content */}</div>
}
```

## Git Workflow

### Branch Naming

- `feat/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates
- `refactor/*` - Code refactoring
- `test/*` - Test additions/updates

### Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/) for all commit messages.

**Format:**

```
<type>(<scope>): <subject>
```

**Types:**

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style/formatting
- `refactor` - Code refactoring
- `test` - Test additions/updates
- `chore` - Maintenance tasks
- `build` - Build system changes
- `ci` - CI/CD changes

**Scopes:**

- `core` - packages/core
- `renderer` - packages/renderer
- `intake` - packages/intake
- `assets` - packages/assets
- `animations-2d` - packages/animations-2d
- `animations-3d` - packages/animations-3d
- `studio` - apps/studio
- `docs` - Documentation
- `ci` - GitHub Actions/workflows
- `deps` - Dependency updates

**Examples:**

```
feat(renderer): add --max-duration flag
fix(intake): guardrail detection for Math.random
docs(readme): update installation instructions
refactor(core): simplify type definitions
test(animations-2d): add fade animation tests
chore: update dependencies
```

### Commit Message Validation

Commit messages are validated in CI using commitlint. Your commits must follow the conventional format.

To manually validate your commits before pushing:

```bash
npx commitlint --from HEAD~1 --to HEAD
```

## Pull Request Process

### Before Submitting

1. **Ensure all tests pass**

   ```bash
   npm test
   ```

2. **Run linting and type checking**

   ```bash
   npm run lint
   npm run typecheck
   ```

3. **Update documentation**
   - Update README if adding new features
   - Add inline documentation for complex functions
   - Update docs/ directory if needed

4. **Write meaningful commit messages**
   - Each commit should be a logical unit of change
   - Squash related commits together

### PR Description

Use the [PR template](.github/PULL_REQUEST_TEMPLATE.md) to structure your description:

- **Type**: Bug fix, feature, breaking change, etc.
- **Description**: What and why
- **Checklist**: Verify you've completed all items
- **Breaking Changes**: Document any breaking changes
- **Related Issues**: Link to related issues

### Review Process

1. A reviewer will be assigned based on CODEOWNERS
2. Address any feedback
3. Once approved, your PR will be merged

### Merge Strategy

- Squash and merge for feature branches
- Keep commit history clean and meaningful

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run specific test file
npm test -- MyTest.test.ts

# Run tests matching pattern
npm test -- -t "test description"
```

### Writing Tests

- Place tests in `__tests__/` directories alongside source files
- Use Vitest for testing
- Test component logic, utilities, and edge cases
- Aim for 80%+ code coverage

### Test Types

- **Unit Tests**: Test individual functions/components
- **Integration Tests**: Test interactions between modules
- **E2E Tests**: Test complete user workflows

## Documentation

### When to Update Documentation

- Adding new features
- Changing existing behavior
- Fixing common issues
- Updating configuration options

### Documentation Types

1. **README.md**: Project overview and quickstart
2. **docs/\*.md**: Detailed documentation
3. **Inline comments**: Complex logic explanations
4. **Type comments**: JSDoc for public APIs

## Additional Resources

- [Remotion Documentation](https://www.remotion.dev/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Vitest Guide](https://vitest.dev/guide)

## Questions?

If you have questions, feel free to:

- Open an issue
- Ask in discussions
- Contact maintainers

Thank you for contributing! 🚀
