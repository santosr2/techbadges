# GitHub Actions Workflows

This directory contains all CI/CD workflows for TechBadges.

## Workflows

### 🔄 ci.yml - Continuous Integration
**Triggers**: Push to main/develop, Pull Requests

**Jobs**:
- **Quality**: Linting, formatting, type checking
- **Test**: Unit & integration tests, coverage
- **Validate**: Icon validation, size reporting
- **Build**: Build artifacts

**Purpose**: Ensures code quality on every commit

---

### 🚀 deploy.yml - Deployment
**Triggers**: Push to main, Version tags (v*.*.*), Manual

**Jobs**:
- Build project
- Deploy to Cloudflare Workers
- Health check verification
- Comment on releases (for tagged releases)

**Purpose**: Automatic deployment to production

---

### 📦 release.yml - Release Creation
**Triggers**: Manual workflow dispatch

**Inputs**:
- Version bump type: `patch`, `minor`, or `major`

**Jobs**:
1. Install bump-my-version and git-cliff
2. Bump version using bump-my-version
3. Generate changelog using git-cliff
4. Run tests
5. Create git commit and tag
6. Push changes
7. Create GitHub release with generated notes
8. Trigger deployment

**Purpose**: Automated release creation with proper versioning

**Tools used**:
- [bump-my-version](https://github.com/callowayproject/bump-my-version)
- [git-cliff](https://git-cliff.org)

---

### 🔒 security.yml - Security Scanning
**Triggers**: Push, PRs, Daily at midnight UTC, Manual

**Jobs**:
- **CodeQL**: Static security analysis
- **Dependency Review**: PR-based dependency check
- **NPM Audit**: Vulnerability scanning
- **Secret Scanning**: TruffleHog for exposed secrets
- **License Check**: OSS license compliance
- **Summary**: Combined security status

**Purpose**: Continuous security monitoring

---

### 🏷️ badges.yml - Badge Status
**Triggers**: Daily, Manual

**Purpose**: Badge status tracking and documentation

---

## Workflow Dependencies

```
┌─────────────┐
│  PR/Commit  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│     CI      │  ← Quality checks, tests
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Merge     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Release   │  ← Manual trigger, bump version, generate changelog
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Deploy    │  ← Triggered by tag push
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Production  │
└─────────────┘

       │
       │ (parallel)
       ▼
┌─────────────┐
│  Security   │  ← Runs daily + on PRs
└─────────────┘
```

## Running Workflows

### Manually Trigger

1. Go to **Actions** tab
2. Select workflow
3. Click "Run workflow"
4. Select branch and inputs
5. Click "Run workflow"

### Via Code

Workflows run automatically on:
- Push to main/develop
- Pull requests
- Tag creation
- Schedule (security: daily)

## Secrets Required

### GitHub Secrets

- `CF_API_TOKEN`: Cloudflare API token (for deployment)
- `CF_ACCOUNT_ID`: Cloudflare account ID (for deployment)
- `CODECOV_TOKEN`: Codecov upload token (optional, for coverage)

### Setting Secrets

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click "New repository secret"
3. Add name and value
4. Click "Add secret"

## Workflow Status

Check workflow status:
- Actions tab: All workflow runs
- README badges: Current status
- Security tab: Security scan results
- Releases: Release history

## Troubleshooting

### Workflow Failed

1. Click on failed workflow run
2. Expand failed job
3. Review error logs
4. Fix issue in code
5. Push fix or re-run workflow

### Common Issues

**CI Fails**:
- Run `mise run check` locally first
- Check linting/formatting/tests

**Deploy Fails**:
- Verify Cloudflare secrets are set
- Check build succeeds locally
- Review Cloudflare Workers logs

**Release Fails**:
- Ensure all commits follow conventional format
- Check bump-my-version and git-cliff are installed
- Verify no uncommitted changes

**Security Alerts**:
- Review in Security tab
- Update vulnerable dependencies
- Create hotfix if critical

## Best Practices

1. **Always run CI locally** before pushing
2. **Use conventional commits** for automatic changelogs
3. **Test releases** in a branch first if unsure
4. **Monitor security scans** regularly
5. **Keep workflows updated** with latest actions

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Project DevSecOps Guide](../../docs/DEVSECOPS.md)
- [Release Guide](../../docs/RELEASE_GUIDE.md)

