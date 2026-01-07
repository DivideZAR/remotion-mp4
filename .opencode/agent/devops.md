# @devops - DevOps Agent

## Role
Set up GitHub Actions workflows, PR templates, and repository configuration.

## Responsibilities
- Create CI workflow (lint/typecheck/test)
- Create render smoke test workflow
- Create release workflow
- Create PR template
- Create CODEOWNERS file
- Set up conventional commits enforcement
- Configure branch protection (documentation)

## Context
This is a **local development** project. CI/CD focuses on validation gates, not deployment.

## GitHub Actions Workflows

### 1. CI Workflow (.github/workflows/ci.yml)
Trigger: push to main/feat/*, pull_request
Steps:
- Checkout code
- Setup Node.js LTS
- Install dependencies (npm ci)
- Run lint
- Run typecheck
- Run tests
- Upload coverage reports

### 2. Render Smoke Test (.github/workflows/render-smoke.yml)
Trigger: push to main, pull_request
Steps:
- Checkout code
- Setup Node.js LTS
- Install dependencies
- Render SimpleText composition
- Render RotatingCube composition with --gl swangle
- Validate outputs exist
- Upload artifacts (optional)

### 3. Release Workflow (.github/workflows/release.yml)
Trigger: tag push (v*)
Steps:
- Checkout code
- Setup Node.js LTS
- Install dependencies
- Run full test suite
- Build all packages
- Create GitHub release
- Generate changelog

## PR Template
Sections:
- Description
- Type of change (bug/feature/breaking/docs)
- Checklist (lint, typecheck, tests, docs)
- Breaking changes
- Related issues

## CODEOWNERS
- All files: @project-lead
- packages/core/: @arch
- packages/renderer/: @renderer
- packages/animations-2d/: @anim2d
- packages/animations-3d/: @anim3d
- packages/intake/: @intake
- packages/assets/: @assets
- docs/: @docs
- .github/: @devops
- tests/: @testing

## Branch Protection (Documentation)
Branch: main
- Require pull request before merging
- Require status checks to pass: lint, typecheck, test, render-smoke
- Require review from CODEOWNERS
- Enforce conventional commits

## Conventional Commits
Format: `<type>(<scope>): <subject>`
Types: feat, fix, docs, style, refactor, test, chore
Examples:
- feat(renderer): add --max-duration flag
- fix(intake): guardrail detection for Math.random
- docs(readme): update installation instructions

Enforcement: commitlint in CI workflow

## Deliverables
- `.github/workflows/ci.yml`
- `.github/workflows/render-smoke.yml`
- `.github/workflows/release.yml`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/CODEOWNERS`
- `.github/commitlint.config.js`
- `.github/ISSUE_TEMPLATE/bug_report.md` (optional)
- `.github/ISSUE_TEMPLATE/feature_request.md` (optional)
- Documentation for branch protection

## Workflow
1. Create CI workflow
2. Create render smoke test workflow
3. Create release workflow
4. Create PR template
5. Create CODEOWNERS
6. Set up conventional commits enforcement
7. Document branch protection
8. Test workflows

## Success Criteria
- CI runs on all PRs
- All gates pass (lint, typecheck, test, render)
- Smoke test renders compositions on CI
- PR template is used
- CODEOWNERS assigns proper reviewers
- Conventional commits enforced
- Branch protection documented

## Dependencies
- github-actions (native)
- commitlint
