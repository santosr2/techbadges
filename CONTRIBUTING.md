# Contributing to TechBadges

Thank you for your interest in contributing to TechBadges! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Development Setup](#development-setup)
- [Code Contributions](#code-contributions)
- [Icon Contributions](#icon-contributions)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Commit Messages](#commit-messages)

## Development Setup

### Prerequisites

- [mise](https://mise.jdx.dev/) - Tool version manager (manages Bun and other tools)

### Getting Started

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/santosr2/techbadges.git
   cd techbadges
   ```

2. Install tools via mise:
   ```bash
   mise install
   ```

3. Install dependencies:
   ```bash
   mise run install
   # or: bun install
   ```

4. Start the development server:
   ```bash
   mise run dev
   # or: bun run dev
   ```

5. The local server will be available at `http://localhost:8787`

### Available Commands

All commands can be run via `mise run <task>` or directly with `bun`:

| Command | Description |
|---------|-------------|
| `mise run install` | Install dependencies |
| `mise run dev` | Start local development server |
| `mise run build` | Build the icon bundle |
| `mise run build:optimize` | Optimize SVGs and build |
| `mise run lint` | Run Biome linter |
| `mise run lint:fix` | Fix linting issues |
| `mise run format` | Format code with Biome |
| `mise run typecheck` | Run TypeScript type checking |
| `mise run test` | Run tests |
| `mise run test:watch` | Run tests in watch mode |
| `mise run validate` | Validate all icons |
| `mise run check` | Run all checks (lint, typecheck, test) |

## Code Contributions

### Before You Start

1. Check existing issues and PRs to avoid duplicating work
2. For significant changes, open an issue first to discuss the approach
3. Ensure your changes align with the project's goals

### Making Changes

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following our [code style](#code-style) guidelines

3. Add tests for new functionality

4. Ensure all checks pass:
   ```bash
   mise run check
   ```

5. Commit your changes using [conventional commit messages](#commit-messages)

## Icon Contributions

We accept icon contributions through a review process. See our [Icon Guidelines](./docs/ICON_GUIDELINES.md) for detailed requirements.

### Quick Overview

1. **Open an Issue First**: Use the "Icon Suggestion" template
2. **Wait for Approval**: A maintainer will review your suggestion
3. **Submit a PR**: Once approved, submit your icon following our technical specifications

### Icon Requirements

- Format: SVG only
- Dimensions: 256x256 pixels
- Max file size: 50KB (ideally under 20KB)
- Naming: `IconName.svg` or `IconName-Dark.svg` / `IconName-Light.svg`

## Pull Request Process

1. Ensure your branch is up to date with `main`
2. Fill out the PR template completely
3. Link related issues
4. Wait for CI checks to pass
5. Request review from maintainers
6. Address any feedback
7. Once approved, a maintainer will merge your PR

### PR Checklist

- [ ] Code follows the project's style guidelines
- [ ] Tests added for new functionality
- [ ] All tests pass locally
- [ ] Documentation updated if needed
- [ ] Commit messages follow conventions
- [ ] PR description explains the changes

## Code Style

We use [Biome](https://biomejs.dev/) for linting and formatting. The configuration is in `biome.json`.

### TypeScript Guidelines

- Use explicit return types for functions
- Prefer `const` over `let`
- Use type imports: `import type { Foo } from './foo'`
- Avoid `any` - use `unknown` if type is truly unknown
- Use meaningful variable names

### File Organization

```
src/
├── index.ts           # Worker entry point
├── handlers/          # Request handlers
├── lib/               # Utility functions
├── config/            # Configuration
└── types/             # Type definitions
```

### Running Linter

```bash
# Check for issues
mise run lint

# Fix issues automatically
mise run lint:fix

# Format code
mise run format
```

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(icons): add Bun runtime icon
fix(api): correct theme parameter validation
docs: update contribution guidelines
perf(svg): optimize grid generation
```

## Questions?

If you have questions, feel free to:
- Open a discussion on GitHub
- Comment on an existing issue
- Reach out to maintainers

Thank you for contributing!
