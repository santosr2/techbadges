# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 2.x     | :white_check_mark: |
| 1.x     | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **GitHub Security Advisories**: Use the "Report a vulnerability" button in the Security tab of this repository
2. **GitHub Issues**: For non-sensitive security issues, open an issue at https://github.com/santosr2/techbadges/issues

### What to Include

Please include as much of the following information as possible:

- Type of vulnerability (e.g., XSS, injection, denial of service)
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 1 week
- **Resolution**: Typically within 2-4 weeks, depending on complexity

### What to Expect

1. We will acknowledge receipt of your vulnerability report
2. We will investigate and validate the reported issue
3. We will work on a fix and coordinate disclosure timing with you
4. We will publicly acknowledge your responsible disclosure (unless you prefer anonymity)

## Security Best Practices for Contributors

When contributing to this project, please:

- Never commit secrets, API keys, or credentials
- Validate and sanitize all user input
- Use parameterized queries if adding database functionality
- Follow the principle of least privilege
- Keep dependencies up to date

## Scope

This security policy applies to:

- The main TechBadges service
- Official deployment configurations
- Build and deployment scripts

This policy does not cover:

- Third-party forks or deployments
- Issues in dependencies (report those to the respective projects)
- Social engineering attacks

Thank you for helping keep TechBadges and its users safe!
