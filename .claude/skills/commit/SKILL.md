# Commit

Create a conventional commit with preview and approval flow.

## When to Use

Run `/commit` to stage, preview, and commit changes using the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) spec.

## Conventional Commits Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`
**Scope:** Optional, in parentheses — the area of code affected (e.g., `feat(streak):`)
**Breaking changes:** Add `!` before colon or `BREAKING CHANGE:` footer
**Description:** Imperative, lowercase, no period at end

## Steps

### 1. Analyze Changes

Run these commands to understand what changed:

```bash
git status
git diff
git diff --cached
```

### 2. Draft Commit Message

Based on the changes, draft a conventional commit message:
- Pick the correct **type** based on the nature of changes
- Add a **scope** if the change is isolated to a specific area
- Write a concise **description** in imperative mood, lowercase
- Add a **body** only if the change needs more context
- Add `BREAKING CHANGE:` footer if applicable

### 3. Preview and Ask for Approval

Show the user a preview of:
- Files that will be staged
- The proposed commit message (formatted in a code block)

Then use `AskUserQuestion` to ask the user to approve or reject the commit. Options:
- **Commit** — proceed with the proposed message
- **Edit** — let the user provide a different message (use "Other" option)
- **Cancel** — abort

### 4. Stage and Commit

If approved:
1. Stage the relevant files (prefer specific files over `git add -A`)
2. Create the commit using the approved message
3. Always append the co-author trailer:
   ```
   Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
   ```

Use a HEREDOC to pass the commit message:
```bash
git commit -m "$(cat <<'EOF'
<commit message here>

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

### 5. Ask to Push

After a successful commit, use `AskUserQuestion` to ask:
- **Push** — run `git push`
- **Push (force)** — run `git push --force-with-lease` (only if needed, e.g., after rebase)
- **Skip** — don't push, just leave the commit local

Report the final result (commit hash, push status).
