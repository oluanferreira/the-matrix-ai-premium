---
name: Claude Code Secret Patterns
description: 30+ regex patterns for detecting hardcoded secrets across major providers
type: reference
project: lmas
source: davila7/claude-code-templates (secret-scanner hook)
absorbed: 2026-03-31
tags:
  - project/lmas
  - security
  - hooks
  - secrets
  - scanning
---

# Secret Patterns Reference — Claude Code

Regex patterns for detecting hardcoded secrets in code before commit. Organized by provider with severity classification.

## Usage

These patterns can be used in:
- Pre-commit hooks (PreToolUse Bash matcher)
- CI/CD pipelines
- Manual audits
- Custom secret-scanner implementations

## Patterns by Provider

### CRITICAL Severity

| Provider | Pattern | Description |
|----------|---------|-------------|
| **AWS Access Key** | `AKIA[0-9A-Z]{16}` | AWS IAM access key ID |
| **AWS Secret Key** | `(?i)aws_secret_access_key\s*=\s*[A-Za-z0-9/+=]{40}` | AWS secret access key |
| **Private Key** | `-----BEGIN (RSA\|DSA\|EC\|OPENSSH) PRIVATE KEY-----` | Any private key file |
| **Stripe Live** | `sk_live_[0-9a-zA-Z]{24,}` | Stripe live secret key |
| **GitHub Token** | `ghp_[0-9a-zA-Z]{36}` | GitHub personal access token |
| **GitHub OAuth** | `gho_[0-9a-zA-Z]{36}` | GitHub OAuth access token |
| **GitHub App** | `ghs_[0-9a-zA-Z]{36}` | GitHub App installation token |
| **GitHub Refresh** | `ghr_[0-9a-zA-Z]{36}` | GitHub refresh token |

### HIGH Severity

| Provider | Pattern | Description |
|----------|---------|-------------|
| **Anthropic** | `sk-ant-[a-zA-Z0-9_-]{20,}` | Anthropic API key |
| **OpenAI** | `sk-[a-zA-Z0-9]{20,}` | OpenAI API key |
| **Google API** | `AIza[0-9A-Za-z_-]{35}` | Google API key |
| **Stripe Test** | `sk_test_[0-9a-zA-Z]{24,}` | Stripe test secret key |
| **Supabase** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+` | Supabase service role JWT |
| **Slack Token** | `xox[bpas]-[0-9a-zA-Z-]+` | Slack bot/user/app token |
| **Slack Webhook** | `https://hooks\.slack\.com/services/T[A-Z0-9]+/B[A-Z0-9]+/[a-zA-Z0-9]+` | Slack incoming webhook |
| **Discord Webhook** | `https://discord(app)?\.com/api/webhooks/[0-9]+/[a-zA-Z0-9_-]+` | Discord webhook URL |
| **Twilio** | `SK[0-9a-fA-F]{32}` | Twilio API key |
| **SendGrid** | `SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}` | SendGrid API key |
| **Mailgun** | `key-[0-9a-zA-Z]{32}` | Mailgun API key |

### MEDIUM Severity

| Provider | Pattern | Description |
|----------|---------|-------------|
| **GitLab** | `glpat-[0-9a-zA-Z_-]{20}` | GitLab personal access token |
| **Vercel** | `(?i)vercel[_\s]*token\s*[:=]\s*[A-Za-z0-9]{24,}` | Vercel token |
| **HuggingFace** | `hf_[a-zA-Z0-9]{34}` | HuggingFace API token |
| **Replicate** | `r8_[a-zA-Z0-9]{40}` | Replicate API token |
| **Groq** | `gsk_[a-zA-Z0-9]{48,}` | Groq API key |
| **Cloudflare** | `(?i)cloudflare[_\s]*api[_\s]*(?:key\|token)\s*[:=]\s*[A-Za-z0-9_-]{37,}` | Cloudflare API credentials |
| **DigitalOcean** | `dop_v1_[a-f0-9]{64}` | DigitalOcean personal access token |
| **Linear** | `lin_api_[a-zA-Z0-9]{40}` | Linear API key |
| **Notion** | `(?:secret_|ntn_)[a-zA-Z0-9]{43}` | Notion API key |
| **Figma** | `figd_[a-zA-Z0-9_-]{40,}` | Figma personal access token |
| **npm** | `npm_[a-zA-Z0-9]{36}` | npm access token |
| **PyPI** | `pypi-[a-zA-Z0-9_-]{100,}` | PyPI API token |
| **Telegram Bot** | `[0-9]{8,10}:[a-zA-Z0-9_-]{35}` | Telegram bot token |
| **Databricks** | `dapi[a-f0-9]{32}` | Databricks API token |
| **Azure** | `(?i)(?:DefaultEndpointsProtocol=https;AccountName=)[a-zA-Z0-9;=/+]+` | Azure connection string |

### LOW Severity

| Provider | Pattern | Description |
|----------|---------|-------------|
| **Generic Password** | `(?i)(?:password\|passwd\|pwd)\s*[:=]\s*['"][^'"]{8,}['"]` | Hardcoded password |
| **Generic Secret** | `(?i)(?:secret\|token\|api_key\|apikey)\s*[:=]\s*['"][^'"]{8,}['"]` | Generic secret assignment |
| **DB Connection** | `(?i)(?:mysql\|postgres\|mongodb\|redis)://[^:]+:[^@]+@` | Database connection string with credentials |
| **JWT** | `eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*` | JSON Web Token (may be intentional) |

## Implementation Notes

- Patterns should be applied to staged files (`git diff --cached --name-only`)
- Skip binary files, node_modules, vendor dirs, lock files
- For JWT patterns, check if it's in a test file before flagging
- For generic patterns (LOW), reduce false positives by checking file extension
- Exit code 2 blocks the commit in Claude Code hooks
- Use `permissionDecision: deny` in hook output for programmatic blocking

## False Positive Reduction

Files to SKIP scanning:
- `*.lock`, `package-lock.json`, `yarn.lock`
- `node_modules/**`, `vendor/**`, `.git/**`
- `*.min.js`, `*.min.css`
- `*.test.*`, `*.spec.*` (for LOW severity only)
- `.env.example`, `.env.template` (template files)
