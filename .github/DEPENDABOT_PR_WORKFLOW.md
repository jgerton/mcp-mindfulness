# Dependabot PR Testing Workflow

## Why Test Dependabot PRs?

Even though Dependabot PRs are automated, **you should always test them locally** before merging because:

1. ✅ **Breaking Changes**: Even patch updates can introduce breaking changes
2. ✅ **Build Verification**: Ensure the update doesn't break the build
3. ✅ **Test Compatibility**: Verify tests still pass with new version
4. ✅ **Runtime Issues**: Catch issues that static analysis misses
5. ✅ **Dependency Conflicts**: Identify version conflicts with other packages

## Standard Testing Workflow

### Step 1: Fetch and Checkout PR

```bash
# Fetch the PR branch
git fetch origin pull/[PR_NUMBER]/head:pr-[PR_NUMBER]

# Checkout the PR
git checkout pr-[PR_NUMBER]

# Or use gh CLI (easier)
gh pr checkout [PR_NUMBER]
```

### Step 2: Install Dependencies

```bash
# Clean install to ensure lock file is used
rm -rf node_modules
pnpm install --frozen-lockfile

# Verify the correct version was installed
pnpm list [package-name]
```

### Step 3: Run Build

```bash
# TypeScript compilation
pnpm build

# Check for any build errors
echo $?  # Should output 0
```

### Step 4: Run Tests

```bash
# Full test suite
pnpm test

# Or run tests for specific areas affected by the update
pnpm test -- --testPathPattern=affected-area

# Check test coverage didn't decrease
pnpm test:coverage
```

### Step 5: Manual Smoke Testing

```bash
# Start the development server
pnpm dev

# Test critical user flows:
# - Authentication
# - Core features using the updated package
# - Any known edge cases

# Check for console errors or warnings
```

### Step 6: Security Audit

```bash
# Run security audit
pnpm audit

# Check for new vulnerabilities
pnpm audit --audit-level=moderate

# If vulnerabilities found, check if they're in the updated package
pnpm audit --json | jq '.advisories'
```

### Step 7: Document Results

Create a testing checklist in the PR comment:

```markdown
## Testing Results

### Build: ✅ Passed
- TypeScript compilation: Success
- No new build errors

### Tests: ✅ Passed (or ⚠️ See notes)
- Unit tests: 269 passed
- Integration tests: 7 passed
- Coverage: Maintained at X%

### Security: ✅ No new vulnerabilities
- pnpm audit: Clean

### Manual Testing: ✅ Passed
- [x] Authentication works
- [x] Core features functional
- [x] No console errors

### Recommendation: ✅ Safe to merge
```

## Batch Testing Multiple Dependabot PRs

When you have multiple Dependabot PRs (like we do now), test them in order:

### 1. Create Test Script

```bash
#!/bin/bash
# test-dependabot-prs.sh

PRS=(12 11 10 9)  # List of PR numbers
RESULTS=()

for PR in "${PRS[@]}"; do
  echo "========================================"
  echo "Testing PR #$PR"
  echo "========================================"

  # Checkout PR
  gh pr checkout $PR || { echo "Failed to checkout PR #$PR"; continue; }

  # Clean install
  rm -rf node_modules
  pnpm install --frozen-lockfile || { echo "Install failed for PR #$PR"; RESULTS+=("$PR: FAILED (install)"); continue; }

  # Build
  pnpm build || { echo "Build failed for PR #$PR"; RESULTS+=("$PR: FAILED (build)"); continue; }

  # Test (allow some failures if expected)
  pnpm test 2>&1 | tee "pr-$PR-test-results.txt"

  # Extract test summary
  SUMMARY=$(grep "Test Suites:" "pr-$PR-test-results.txt")
  echo "PR #$PR Results: $SUMMARY"
  RESULTS+=("$PR: $SUMMARY")

  # Go back to main
  git checkout main
done

# Print summary
echo ""
echo "========================================"
echo "SUMMARY"
echo "========================================"
for RESULT in "${RESULTS[@]}"; do
  echo "$RESULT"
done
```

### 2. Run the Script

```bash
chmod +x test-dependabot-prs.sh
./test-dependabot-prs.sh
```

### 3. Review Results

The script will generate:
- Test result files for each PR
- Summary of all PRs
- Clear indication of which PRs are safe to merge

## For Our Current PRs

### PR #12: js-yaml 3.14.1 → 3.14.2
**Priority**: 🔴 **HIGH** (Security fix)

**Test Focus**:
- YAML parsing in config files
- Swagger documentation generation
- Any API that accepts YAML input

**Risk Level**: 🟢 Low (patch update, security fix)

**Command**:
```bash
gh pr checkout 12
pnpm install --frozen-lockfile
pnpm build
pnpm test -- --testPathPattern=yaml
pnpm test -- --testPathPattern=swagger
```

### PR #11: form-data 4.0.2 → 4.0.4
**Priority**: 🟡 **MEDIUM**

**Test Focus**:
- File upload endpoints
- Multipart form data handling
- Export functionality (uses form-data)

**Risk Level**: 🟢 Low (patch update)

**Command**:
```bash
gh pr checkout 11
pnpm install --frozen-lockfile
pnpm build
pnpm test -- --testPathPattern=upload
pnpm test -- --testPathPattern=export
```

### PR #10: brace-expansion 1.1.11 → 1.1.12
**Priority**: 🟡 **MEDIUM**

**Test Focus**:
- File globbing patterns
- Path matching
- Any CLI commands that use glob patterns

**Risk Level**: 🟢 Low (patch update)

**Command**:
```bash
gh pr checkout 10
pnpm install --frozen-lockfile
pnpm build
pnpm test -- --testPathPattern=glob
```

### PR #9: formidable 3.5.2 → 3.5.4
**Priority**: 🟡 **MEDIUM**

**Test Focus**:
- File upload handling
- Form parsing
- Request body parsing

**Risk Level**: 🟢 Low (patch update)

**Command**:
```bash
gh pr checkout 9
pnpm install --frozen-lockfile
pnpm build
pnpm test -- --testPathPattern=upload
pnpm test -- --testPathPattern=form
```

## Quick Decision Matrix

| Test Result | Action |
|-------------|--------|
| ✅ Build passes, all tests pass | **Merge immediately** |
| ✅ Build passes, expected test failures only | **Merge** (if failures pre-existing) |
| ⚠️ Build passes, new test failures | **Investigate**, fix tests if needed |
| ❌ Build fails | **Do not merge**, investigate breaking changes |
| ⚠️ New security vulnerabilities | **Investigate**, may need different version |

## Automation Opportunities

Once CI/CD is set up, this workflow becomes automatic:

1. **GitHub Actions runs on every PR**
   - Builds the code
   - Runs all tests
   - Reports results

2. **Dependabot auto-merge workflow**
   - Waits for CI to pass
   - Auto-merges if patch/minor + CI green
   - Comments on major updates

3. **You only review failures**
   - No need to manually test every PR
   - Focus on PRs that fail CI
   - Review major version bumps

## Current Status (While GitHub is Down)

Since GitHub is experiencing a 500 error, we cannot:
- ❌ Fetch PR branches
- ❌ Check out PRs locally
- ❌ Push commits

**What we can do**:
- ✅ Document the process (this file)
- ✅ Verify our current build works
- ✅ Prepare merge commands for when GitHub recovers

**When GitHub recovers**:
```bash
# Test all PRs
for PR in 12 11 10 9; do
  gh pr checkout $PR
  pnpm install --frozen-lockfile && pnpm build && pnpm test
  git checkout main
done

# If all pass, merge in order (newest first)
gh pr merge 12 --squash --delete-branch
gh pr merge 11 --squash --delete-branch
gh pr merge 10 --squash --delete-branch
gh pr merge 9 --squash --delete-branch
```

## Best Practices Summary

1. ✅ **Always test locally** before merging (even automated PRs)
2. ✅ **Use frozen lockfile** to ensure exact versions
3. ✅ **Run full test suite** to catch regressions
4. ✅ **Check security audit** after updates
5. ✅ **Test in priority order** (security fixes first)
6. ✅ **Document results** in PR comments
7. ✅ **Merge quickly** once verified (don't let PRs pile up)
8. ✅ **Automate with CI/CD** to reduce manual work

## Monitoring After Merge

After merging Dependabot PRs:

```bash
# Verify main branch still builds
git checkout main
git pull
pnpm install
pnpm build
pnpm test

# Check for any issues
pnpm audit

# Monitor production (if deployed)
# - Check error logs
# - Monitor performance metrics
# - Watch for user reports
```

If issues are found:
```bash
# Quick rollback
git revert [merge-commit-hash]
git push origin main

# Or revert to specific version in package.json
pnpm add [package]@[previous-version]
git commit -am "Rollback [package] due to [issue]"
git push origin main
```
