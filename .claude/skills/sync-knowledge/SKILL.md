# Sync Knowledge

Scan the project, update CLAUDE.md, and refresh memory files to reflect the current state of the codebase.

## When to Use

Run `/sync-knowledge` whenever you want to:
- Update project documentation after making changes
- Capture new decisions, patterns, or preferences into memory
- Ensure CLAUDE.md reflects the current architecture
- Save feedback or learnings from this session for future conversations

## Steps

### 1. Scan Current Project State

Read the key project files to understand what has changed:
- `package.json` — dependencies, scripts
- `src/app/` — route structure (glob for `page.tsx` files)
- `src/actions/` — server actions
- `src/components/` — component inventory
- `src/lib/` — utilities and helpers
- `src/middleware.ts` — auth/routing logic
- `next.config.ts` — build config
- `supabase/migrations/` — database schema

Also run `git log --oneline -20` to see recent changes.

### 2. Update CLAUDE.md

Read the current `CLAUDE.md` and update it to reflect:
- Any new or removed routes, components, or actions
- Changed build commands or dependencies
- New architectural patterns or conventions
- Updated deployment info

Keep it concise — CLAUDE.md should be scannable, not exhaustive. Don't list every file; focus on what a new Claude instance needs to be productive.

### 3. Review and Update Memory Files

Check the memory directory at the path shown in the system prompt for auto memory. For each memory file:
- Verify it's still accurate by checking the referenced files/code
- Update if stale, delete if obsolete

Then consider saving NEW memories for:
- **User preferences** discovered this session (coding style, tool preferences, communication style)
- **Feedback** the user gave (corrections, confirmations of approaches)
- **Project context** (deadlines, goals, blockers, decisions made)
- **References** to external systems mentioned (Supabase dashboard URLs, Vercel project, etc.)

Ask the user: "Anything specific you want me to remember for next time?" before finalizing.

### 4. Summary

Print a short summary of what was updated:
- Files modified
- Memories added/updated/removed
- Key changes captured
