# Security Patch & Audit Resolution Plan

> **For Agent:** REQUIRED SUB-SKILL: Use `agent-orchestration-lifecycle` to execute this plan in an isolated git worktree.

**Goal:** Safely resolve critical/high security vulnerabilities in a maintenance-mode app without using `--force` or causing regressions.
**Architecture:** Sequential dependency updates and audit fixes managed by a single `flash` subagent to prevent `package-lock.json` merge conflicts.
**Tech Stack:** Next.js, npm, better-npm-audit

### Task 1: Direct Production Dependency Updates
**Assigned To:** `flash` subagent (Workspace: branch)
**Files:** `package.json`, `package-lock.json`

**Step 1: Update Next.js ecosystem**
Run: `npm install next@latest eslint-config-next@latest @next/bundle-analyzer@latest`
**Step 2: Update sharp**
Run: `npm install sharp@latest`
**Step 3: Verify build**
Run: `npm run build`
**Step 4: Commit**
Commit message: "security: bump next and sharp to patch RCE and libheif vulnerabilities"

### Task 2: Safe Audit Fix & Stale Exception Cleanup
**Assigned To:** Same `flash` subagent (in the same branch to avoid lockfile conflicts)
**Files:** `package.json`, `package-lock.json`, `.nsprc`

**Step 1: Run automatic safe fixes**
Run: `npm audit fix`
**Step 2: Remove stale exceptions**
Remove IDs `1113686, 1114004, 1114005, 1114006, 1114145, 1114170` from `.nsprc`.
**Step 3: Document unfixable dev-only vulnerabilities**
Run `npm run audit`. Append any newly remaining development-only vulnerabilities to `.nsprc` with a justification comment.
**Step 4: Commit**
Commit message: "security: apply safe audit fixes and clean up .nsprc"

### Task 3: Verification & Integration
**Assigned To:** Lead Orchestrator

**Step 1: Verify test suite**
Run: `npm run preflight`
**Step 2: Merge to main**
Check out main, merge the worktree branch, and remove the worktree.
