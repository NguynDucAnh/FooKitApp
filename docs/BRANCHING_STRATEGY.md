# Branching Strategy

## Branches

### `develop` — Development Branch
- All new features are merged here via Pull Requests
- Triggers CI (lint + test) on every push
- **Never commit directly**; always use feature branches

### `deploy` — Production Branch
- Only receives merges from `develop` (after QA sign-off)
- Triggers full CI + Android/iOS build
- Tag this branch with version numbers for releases: `git tag v1.0.0`

## Feature Branch Flow

```
develop
  └── feature/login-screen       ← Member 1
  └── feature/api-integration    ← Member 2
  └── feature/push-notifications ← Member 3
```

## Release Flow

```
develop ──── PR ──── deploy ──── tag v1.0.0 ──── GitHub Release
```

## Protected Branch Rules (set in GitHub Settings)

### `develop`
- Require 1 PR review before merge
- Require status checks: `lint-and-test`
- No force push

### `deploy`
- Require 2 PR reviews before merge
- Require status checks: `lint-and-test`, `android-build`
- No force push
- Restrict who can push: lead developer only
