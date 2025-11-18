# Branch Protection Configuration

This document describes the recommended branch protection rules for the `main` branch.

## Required Configuration

To set up branch protection, go to:
**Settings → Branches → Add branch protection rule**

### Branch name pattern
```
main
```

### Protection Rules

#### Require a pull request before merging
- ✅ **Enabled**
- Required approvals: **1**
- ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ Require review from Code Owners (if CODEOWNERS file exists)

#### Require status checks to pass before merging
- ✅ **Enabled**
- ✅ Require branches to be up to date before merging

**Required status checks**:
- `lint-and-type-check`
- `test`
- `build`
- `security`

#### Other Settings
- ✅ Require conversation resolution before merging
- ✅ Require linear history (optional, prevents merge commits)
- ❌ Do not allow force pushes
- ❌ Do not allow deletions

### Exceptions

**Who can bypass these settings**:
- Repository administrators (for emergency fixes only)
- Dependabot (for auto-merge workflow)

## Setting via GitHub CLI

```bash
# Enable branch protection for main
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["lint-and-type-check","test","build","security"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"dismiss_stale_reviews":true,"required_approving_review_count":1}' \
  --field restrictions=null \
  --field required_linear_history=true \
  --field allow_force_pushes=false \
  --field allow_deletions=false
```

## CI/CD Integration

The branch protection works in conjunction with:

1. **GitHub Actions CI** (`.github/workflows/ci.yml`)
   - Runs on every PR
   - Validates: linting, type-checking, tests, build

2. **Dependabot Auto-merge** (`.github/workflows/dependabot-auto-merge.yml`)
   - Auto-approves and merges patch/minor updates
   - Requires CI checks to pass first

3. **Dependabot Configuration** (`.github/dependabot.yml`)
   - Weekly dependency updates
   - Grouped by development vs production

## Benefits

✅ **Prevents broken code from reaching main**
✅ **Ensures code review for all changes**
✅ **Automates dependency updates safely**
✅ **Maintains clean commit history**
✅ **Catches security vulnerabilities early**

## Testing the Setup

1. Create a test PR that fails tests
2. Verify you cannot merge it
3. Fix the tests, push changes
4. Verify CI passes and PR can be merged

## Troubleshooting

**CI checks not showing up on PR?**
- Ensure workflows exist in `.github/workflows/`
- Check that workflows have `pull_request` trigger
- Verify workflow syntax is correct

**Dependabot PRs not auto-merging?**
- Check Dependabot has write permissions
- Verify CI checks are passing
- Ensure update is patch or minor (not major)

**Need to bypass protection for emergency?**
- Use admin privileges sparingly
- Document reason in commit message
- Create follow-up PR to fix properly
