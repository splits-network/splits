#!/bin/bash
# Memory Checkpoint Hook — runs on Stop events
# Only outputs a reminder when meaningful work was done AND cooldown has passed

COOLDOWN_FILE="/tmp/splits-memory-checkpoint-last"
COOLDOWN_SECONDS=300  # 5 minutes between reminders

# Check cooldown
if [ -f "$COOLDOWN_FILE" ]; then
  last_run=$(cat "$COOLDOWN_FILE")
  now=$(date +%s)
  elapsed=$((now - last_run))
  if [ "$elapsed" -lt "$COOLDOWN_SECONDS" ]; then
    exit 0
  fi
fi

# Check if there are uncommitted changes (signal of meaningful work)
changes=$(git diff --stat 2>/dev/null | tail -1)
staged=$(git diff --cached --stat 2>/dev/null | tail -1)
untracked=$(git ls-files --others --exclude-standard 2>/dev/null | head -5)

if [ -z "$changes" ] && [ -z "$staged" ] && [ -z "$untracked" ]; then
  exit 0
fi

# Count changed files for significance check
file_count=$(git diff --name-only 2>/dev/null | wc -l)
staged_count=$(git diff --cached --name-only 2>/dev/null | wc -l)
total=$((file_count + staged_count))

# Only remind if 3+ files changed (skip trivial edits)
if [ "$total" -lt 3 ]; then
  exit 0
fi

# Update cooldown
date +%s > "$COOLDOWN_FILE"

# Output reminder (injected into conversation)
cat <<'REMINDER'
MEMORY CHECKPOINT — Update .memory/claude/ tree if applicable:
- Decision made? → .memory/claude/decisions/ (date, reasoning, alternatives, expected outcome)
- Lesson learned? → .memory/claude/hindsight/ (what happened, what was harder, what to do differently)
- New pattern discovered? → .memory/claude/patterns/ or .memory/claude/snippets/
- User correction or confirmation? → .memory/claude/feedback/
- Always update the root index: .memory/claude/claude-memory.md
REMINDER
