# GitHub Error Codes Reference

## HTTP Status Codes

### 2xx Success
- **200 OK**: Request successful
- **201 Created**: Resource created successfully (e.g., PR, issue)
- **202 Accepted**: Request accepted, processing asynchronously
- **204 No Content**: Successful request with no response body

### 4xx Client Errors
- **400 Bad Request**: Invalid request syntax or parameters
- **401 Unauthorized**: Authentication required or invalid credentials
  - Check: `gh auth status`
  - Fix: `gh auth login`
- **403 Forbidden**: Valid authentication but insufficient permissions
  - Rate limit exceeded
  - Token lacks required scopes
  - Repository access denied
- **404 Not Found**: Resource doesn't exist
  - Repository, branch, PR, or file not found
- **409 Conflict**: Request conflicts with current state
  - Merge conflicts
  - Resource already exists
- **422 Unprocessable Entity**: Validation failed
  - Invalid JSON
  - Required fields missing
  - Business logic validation errors

### 5xx Server Errors
- **500 Internal Server Error**: GitHub server error
  - **Cause**: Temporary GitHub infrastructure issue
  - **Action**: Wait and retry (usually resolves in 5-30 minutes)
  - **Check Status**: https://www.githubstatus.com/
- **502 Bad Gateway**: Gateway/proxy error
- **503 Service Unavailable**: Service temporarily unavailable
  - Maintenance
  - Overload
- **504 Gateway Timeout**: Request timeout

## Git Error Codes (Exit Codes)

### Common Exit Codes
- **0**: Success
- **1**: Generic error (check error message)
- **128**: Git command failed
  - Network issues
  - Authentication failures
  - Server errors (like our 500)
- **129**: Invalid arguments to git command

## GitHub-Specific Errors

### Rate Limiting
```
Error: API rate limit exceeded
```
**Limits**:
- Unauthenticated: 60 requests/hour
- Authenticated: 5,000 requests/hour
- Search API: 30 requests/minute

**Check your rate limit**:
```bash
gh api rate_limit
```

### Authentication Errors
```
Error: Bad credentials
Error: Token does not have required scopes
```
**Fix**:
```bash
gh auth refresh -s repo,workflow,write:packages
```

### Push Errors

#### Rejected (non-fast-forward)
```
! [rejected] main -> main (non-fast-forward)
```
**Cause**: Remote has commits you don't have locally
**Fix**:
```bash
git pull --rebase origin main
git push origin main
```

#### Rejected (protected branch)
```
! [remote rejected] main -> main (protected branch hook declined)
```
**Cause**: Branch protection rules
**Fix**: Create a PR instead

#### Large File Error
```
Error: File too large (>100 MB)
```
**Fix**: Use Git LFS or reduce file size

### Network Errors

#### Connection Timeout
```
fatal: unable to access 'https://github.com/...': Failed to connect
```
**Check**:
```bash
# Test GitHub connectivity
ssh -T git@github.com
curl -I https://github.com

# Check proxy settings
git config --global http.proxy
```

#### SSL Certificate Error
```
fatal: unable to access 'https://github.com/...': SSL certificate problem
```
**Fix**:
```bash
# Temporary (not recommended for production)
git config --global http.sslVerify false

# Better: Update CA certificates
# Windows: Update Git for Windows
# Mac: Update via Homebrew
# Linux: sudo update-ca-certificates
```

## Troubleshooting Workflow

### Step 1: Check GitHub Status
```bash
curl -s https://www.githubstatus.com/api/v2/status.json
```

### Step 2: Check Authentication
```bash
gh auth status
gh auth refresh
```

### Step 3: Check Network
```bash
ping github.com
curl -I https://github.com
ssh -T git@github.com
```

### Step 4: Check Git Config
```bash
git config --list | grep -E "remote|url|proxy"
git remote -v
```

### Step 5: Try Alternative Methods
```bash
# Switch from HTTPS to SSH
git remote set-url origin git@github.com:user/repo.git

# Or vice versa
git remote set-url origin https://github.com/user/repo.git
```

## Our Current Error: 500 Internal Server Error

**What it means**: GitHub's servers are experiencing issues

**NOT caused by**:
- ❌ Your code
- ❌ Your authentication
- ❌ Your network
- ❌ Your Git configuration

**IS caused by**:
- ✅ Temporary GitHub infrastructure problem
- ✅ Usually resolves automatically in 5-30 minutes
- ✅ Sometimes related to large pushes

**Best practice**:
1. Check https://www.githubstatus.com/
2. Wait 5-10 minutes
3. Retry the push
4. If persistent (>1 hour), contact GitHub Support

## Monitoring GitHub Status

### Via API
```bash
# Current status
curl -s https://www.githubstatus.com/api/v2/status.json | jq

# Recent incidents
curl -s https://www.githubstatus.com/api/v2/incidents.json | jq
```

### Via CLI
```bash
# Check if GitHub API is accessible
gh api /rate_limit

# If this fails, GitHub is likely down
```

### Subscribe to Updates
- Email: https://www.githubstatus.com/
- RSS: https://www.githubstatus.com/history.rss
- Twitter: @githubstatus

## Prevention & Best Practices

### For Network Issues
- Use SSH instead of HTTPS for better reliability
- Configure Git to retry on failures:
  ```bash
  git config --global http.postBuffer 524288000
  git config --global http.lowSpeedLimit 1000
  git config --global http.lowSpeedTime 600
  ```

### For Large Pushes
- Break into smaller commits
- Push frequently (don't accumulate hundreds of changes)
- Use `.gitattributes` to handle large files with LFS

### For Authentication
- Use SSH keys instead of HTTPS tokens
- Rotate tokens regularly
- Use fine-grained personal access tokens with minimal scopes

## Error Code Cheat Sheet

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | ✅ |
| 401 | Auth failed | `gh auth login` |
| 403 | Forbidden | Check permissions/rate limit |
| 404 | Not found | Verify resource exists |
| 409 | Conflict | Resolve merge conflicts |
| 422 | Validation | Check request data |
| 500 | Server error | Wait & retry |
| 503 | Unavailable | Wait for maintenance |
| 128 | Git failed | Check error message |

## Useful Commands

```bash
# Full diagnostic
gh auth status
gh api /rate_limit
git config --list
git remote -v
curl -I https://github.com

# Test specific repository access
gh repo view owner/repo

# Check if you can push
gh repo view --json permissions

# View recent actions
gh run list --limit 5
```
