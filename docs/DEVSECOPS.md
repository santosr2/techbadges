# DevSecOps Process

This document outlines the DevSecOps practices and workflows implemented in the TechBadges project.

## Table of Contents

- [Overview](#overview)
- [Version Management](#version-management)
- [Changelog](#changelog)
- [Release Process](#release-process)
- [CI/CD Pipelines](#cicd-pipelines)
- [Security](#security)
- [Quality Gates](#quality-gates)
- [Dependency Management](#dependency-management)

## Overview

TechBadges follows modern DevSecOps practices to ensure code quality, security, and reliable deployments. Our process includes:

- **Automated Testing**: Every commit is tested
- **Security Scanning**: Regular security audits and dependency checks
- **Automated Releases**: Streamlined version bumping and release creation
- **Continuous Deployment**: Automatic deployment to production on releases
- **Quality Gates**: Linting, formatting, and type checking

## Version Management

We follow [Semantic Versioning](https://semver.org/) (SemVer):

- **MAJOR** version (X.0.0): Incompatible API changes
- **MINOR** version (0.X.0): New functionality (backwards-compatible)
- **PATCH** version (0.0.X): Bug fixes (backwards-compatible)

### Local Version Bumping

Use the version bump script for local development:

```bash
# Bump patch version (1.0.0 -> 1.0.1)
bun run version:bump patch

# Bump minor version (1.0.0 -> 1.1.0)
bun run version:bump minor

# Bump major version (1.0.0 -> 2.0.0)
bun run version:bump major
```

This script will:
1. Update `package.json` version
2. Update `CHANGELOG.md`
3. Create a git commit
4. Create a git tag

Then push to trigger the release:

```bash
git push origin main
git push origin --tags
```

### GitHub Actions Release

Alternatively, use the GitHub Actions workflow:

1. Go to **Actions** → **Release**
2. Click **Run workflow**
3. Select version bump type (patch/minor/major)
4. Click **Run workflow**

This will automatically:
- Bump version
- Update changelog
- Create git tag
- Create GitHub release
- Trigger deployment

## Changelog

We maintain a [CHANGELOG.md](../CHANGELOG.md) following [Keep a Changelog](https://keepachangelog.com/) format.

### Categories

- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security fixes

### Updating the Changelog

Before creating a release, update the `[Unreleased]` section:

```markdown
## [Unreleased]

### Added
- New feature X
- New icon for Y

### Fixed
- Fixed bug Z
```

The release script will automatically move these to the versioned section.

## Release Process

### Automated Release Flow

```
1. Update code & tests
2. Update CHANGELOG.md [Unreleased] section
3. Create PR → Run CI checks
4. Merge PR
5. Run Release workflow (or use version-bump script)
6. Automatic GitHub release creation
7. Automatic deployment to production
```

### Manual Steps (if needed)

1. **Update Changelog**:
   ```bash
   # Edit CHANGELOG.md manually
   vim CHANGELOG.md
   ```

2. **Bump Version**:
   ```bash
   bun run version:bump patch
   ```

3. **Push Changes**:
   ```bash
   git push origin main
   git push origin --tags
   ```

4. **Verify Release**:
   - Check [GitHub Releases](https://github.com/santosr2/techbadges/releases)
   - Verify deployment at https://techbadges.santosr.xyz/health

## CI/CD Pipelines

### CI Workflow (`.github/workflows/ci.yml`)

Runs on every push and PR:

- **Code Quality**:
  - Linting (`biome check`)
  - Format checking (`biome format`)
  - Type checking (`tsc --noEmit`)

- **Tests**:
  - Unit tests
  - Integration tests
  - Coverage reporting

- **Validation**:
  - Icon validation
  - Size reporting

- **Build**:
  - Build artifacts
  - Upload for review

**Triggers**: Push to `main`/`develop`, Pull requests

### Deploy Workflow (`.github/workflows/deploy.yml`)

Deploys to Cloudflare Workers:

- Runs on push to `main`
- Runs on version tags (`v*.*.*`)
- Can be triggered manually

**Steps**:
1. Build project
2. Deploy to Cloudflare Workers
3. Health check
4. Comment on release (for tagged releases)

### Release Workflow (`.github/workflows/release.yml`)

Creates releases:

- Manual trigger only
- Bumps version (patch/minor/major)
- Updates CHANGELOG.md
- Creates git tag
- Generates release notes
- Creates GitHub release

### Security Workflow (`.github/workflows/security.yml`)

Runs security scans:

- **CodeQL Analysis**: Daily scan for security vulnerabilities
- **Dependency Review**: PR-based dependency analysis
- **Bun Audit**: Dependency vulnerability scanning
- **Secret Scanning**: TruffleHog for exposed secrets
- **License Check**: License compliance verification

**Triggers**: 
- Push to `main`/`develop`
- Pull requests
- Daily at midnight UTC
- Manual trigger

## Security

### Security Scanning

We use multiple security tools:

1. **CodeQL**: Static analysis for security vulnerabilities
2. **Dependabot**: Automated dependency updates
3. **Bun Audit**: Vulnerability scanning
4. **TruffleHog**: Secret detection
5. **License Checker**: OSS license compliance

### Reporting Security Issues

**DO NOT** open public issues for security vulnerabilities.

Instead:
1. Go to [Security Advisories](https://github.com/santosr2/techbadges/security/advisories)
2. Click "New draft security advisory"
3. Provide details

See [SECURITY.md](../SECURITY.md) for more information.

### Security Best Practices

- Dependencies are automatically updated weekly by Dependabot
- Security scans run daily
- All PRs require passing security checks
- Secrets are stored in GitHub Secrets
- No credentials in code or git history

## Quality Gates

All PRs must pass:

1. ✅ **Linting**: Code style compliance
2. ✅ **Formatting**: Consistent code formatting
3. ✅ **Type Checking**: No TypeScript errors
4. ✅ **Tests**: All tests passing
5. ✅ **Build**: Successful build
6. ✅ **Security**: No critical vulnerabilities

### Running Quality Checks Locally

```bash
# Run all checks
bun run lint          # Check code style
bun run format:check  # Check formatting
bun run typecheck     # Check types
bun run test          # Run tests
bun run build         # Build project

# Auto-fix issues
bun run lint:fix      # Fix linting issues
bun run format        # Format code
```

### Pre-commit Hooks

We use Husky for pre-commit hooks:

```bash
# Install hooks
bun install

# Hooks will run automatically on commit
git commit -m "feat: add new feature"
```

## Dependency Management

### Dependabot Configuration

Dependabot automatically:
- Checks for updates weekly (Mondays at 09:00 UTC)
- Groups related dependencies
- Creates PRs for updates
- Assigns to maintainers

Configuration: `.github/dependabot.yml`

### Dependency Groups

- **Cloudflare**: Cloudflare Workers and Wrangler
- **Testing**: Test frameworks and types
- **Dev Tools**: Linters, formatters, build tools

### Reviewing Dependency PRs

1. Check Dependabot PR
2. Review changelog and breaking changes
3. Ensure CI passes
4. Test locally if needed
5. Merge PR

## Monitoring and Observability

### Health Checks

- Endpoint: `https://techbadges.santosr.xyz/health`
- Checks: API health, icon availability
- Monitored after each deployment

### Deployment Verification

After deployment:
1. Health check runs automatically
2. Status posted to release (for tagged releases)
3. Manual verification recommended

### Metrics

- GitHub Actions workflow runs
- Code coverage (Codecov)
- Security scan results
- Dependency update frequency

## Workflows Quick Reference

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| CI | Push, PR | Quality checks, tests, build |
| Deploy | Push to main, tags | Deploy to production |
| Release | Manual | Create releases |
| Security | Daily, PR | Security scans |

## Best Practices

### For Contributors

1. **Before committing**:
   - Run `bun run lint:fix`
   - Run `bun run format`
   - Run `bun run test`

2. **For PRs**:
   - Fill out PR template
   - Ensure CI passes
   - Update documentation
   - Add tests for new features

3. **For releases**:
   - Update CHANGELOG.md
   - Use semantic versioning
   - Test thoroughly

### For Maintainers

1. **Weekly**:
   - Review Dependabot PRs
   - Check security scan results
   - Review open issues

2. **Before releases**:
   - Review CHANGELOG.md
   - Ensure all tests pass
   - Verify documentation is current

3. **After releases**:
   - Monitor deployment
   - Verify health checks
   - Close related issues

## Troubleshooting

### CI Failures

**Linting errors**:
```bash
bun run lint:fix
```

**Format errors**:
```bash
bun run format
```

**Test failures**:
```bash
bun run test --watch
```

**Build errors**:
```bash
bun run build
# Check error output
```

### Release Issues

**Version conflict**:
- Ensure version in `package.json` matches git tags
- Use `git tag -d vX.X.X` to delete local tags
- Use `git push --delete origin vX.X.X` to delete remote tags

**Changelog issues**:
- Ensure `[Unreleased]` section exists
- Check link format at bottom of file

### Deployment Issues

**Health check fails**:
- Check Cloudflare Workers dashboard
- Review deployment logs
- Verify environment variables

**Build fails**:
- Check GitHub Actions logs
- Verify dependencies are installed
- Ensure no syntax errors

## Resources

- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)

## Support

- 📖 [Documentation](../docs/)
- 💬 [Discussions](https://github.com/santosr2/techbadges/discussions)
- 🐛 [Issues](https://github.com/santosr2/techbadges/issues)
- 🔒 [Security](../SECURITY.md)

