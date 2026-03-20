#!/bin/bash
# Memory Checkpoint Hook — runs on Stop events
# Context-aware: detects WHAT changed and gives targeted memory update reminders

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

# Gather all changed files (staged + unstaged + untracked)
all_files=$(
  git diff --name-only 2>/dev/null
  git diff --cached --name-only 2>/dev/null
  git ls-files --others --exclude-standard 2>/dev/null
)

# Exit if no changes
if [ -z "$all_files" ]; then
  exit 0
fi

# Count total changed files
total=$(echo "$all_files" | sort -u | wc -l)

# Only remind if 3+ files changed (skip trivial edits)
if [ "$total" -lt 3 ]; then
  exit 0
fi

# Update cooldown
date +%s > "$COOLDOWN_FILE"

# --- Detect categories of changes ---
hints=""

# Migrations → schema/enums memory may be stale
if echo "$all_files" | grep -q "supabase/migrations/"; then
  hints="${hints}\n  → MIGRATION detected: update .memory/claude/schema/ and/or .memory/claude/enums/ if columns/constraints changed"
fi

# New or changed services
if echo "$all_files" | grep -q "services/.*/src/v3/"; then
  hints="${hints}\n  → V3 SERVICE changes: update .memory/claude/snippets/ if patterns changed, .memory/claude/migration-status/ if new resources added"
fi

# Gateway route changes
if echo "$all_files" | grep -q "services/api-gateway/src/routes/"; then
  hints="${hints}\n  → GATEWAY routes changed: update .memory/claude/architecture/ if new routes/services added"
fi

# New service directories
new_services=$(echo "$all_files" | grep -o 'services/[^/]*' | sort -u | while read svc; do
  if [ ! -d "$svc/src" ] 2>/dev/null; then echo "$svc"; fi
done)
if [ -n "$new_services" ]; then
  hints="${hints}\n  → NEW SERVICE detected: update .memory/claude/architecture/ and .memory/claude/migration-status/"
fi

# Package changes (shared libs)
if echo "$all_files" | grep -q "packages/shared-fastify/\|packages/shared-types/\|packages/shared-api-client/"; then
  hints="${hints}\n  → SHARED PACKAGE changed: update .memory/claude/patterns/error-handling if error classes changed, .memory/claude/snippets/ if patterns changed"
fi

# Integration/webhook changes
if echo "$all_files" | grep -q "webhook"; then
  hints="${hints}\n  → WEBHOOK code changed: update .memory/claude/integrations/ if third-party patterns changed"
fi

# Docker/K8s/infra changes
if echo "$all_files" | grep -q "docker-compose\|infra/k8s/\|Dockerfile"; then
  hints="${hints}\n  → INFRA changed: update .memory/claude/environment/ if ports, routing, or config changed"
fi

# Domain consumer / event changes
if echo "$all_files" | grep -q "domain-consumer\|publisher\|rabbitmq"; then
  hints="${hints}\n  → EVENT SYSTEM changed: update .memory/claude/snippets/events/ if publisher/consumer patterns changed"
fi

# Frontend pattern changes
if echo "$all_files" | grep -q "apps/portal/\|apps/candidate/"; then
  # Only flag if many frontend files changed (likely a pattern shift)
  frontend_count=$(echo "$all_files" | grep -c "apps/portal/\|apps/candidate/")
  if [ "$frontend_count" -gt 5 ]; then
    hints="${hints}\n  → SIGNIFICANT FRONTEND changes ($frontend_count files): update .memory/claude/snippets/portal/ if page/hook patterns changed"
  fi
fi

# Output targeted reminder
echo "MEMORY CHECKPOINT — $total files changed this session."

if [ -n "$hints" ]; then
  echo -e "\nTargeted updates:${hints}"
fi

# Always include general reminders
cat <<'GENERAL'

General (always check):
  - Decision made? → .memory/claude/decisions/
  - Lesson learned? → .memory/claude/hindsight/
  - User correction or confirmation? → .memory/claude/feedback/
GENERAL
