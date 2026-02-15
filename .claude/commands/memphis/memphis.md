# /memphis - Memphis Design System Migration Command

**Category:** Design System
**Description:** Centralized command system for migrating apps to Memphis design system

## Overview

The `/memphis` command launches the Memphis migration orchestrator, which coordinates the systematic migration of portal, candidate, and corporate apps to the Memphis design system.

## Usage

```bash
/memphis                    # Launch interactive migration orchestrator
/memphis:migrate <target>   # Migrate specific page/component
/memphis:audit <app>        # Audit app for Memphis compliance
/memphis:validate <file>    # Validate Memphis design patterns
/memphis:extract <page>     # Extract reusable component from page
/memphis:theme              # Update Memphis theme configuration
```

## Memphis Design Principles

- **Flat design**: No shadows, gradients, or 3D effects
- **Sharp corners**: border-radius: 0 (no rounded corners)
- **Thick borders**: 4px borders on all components
- **Bold colors**: coral #FF6B6B, teal #4ECDC4, yellow #FFE66D, purple #A78BFA
- **Geometric shapes**: Squares, rectangles, triangles, circles
- **High contrast**: dark #1A1A2E on cream #F5F0EB

## Architecture

### Command Flow
1. User invokes `/memphis` command
2. memphis-orchestrator agent spawned
3. Orchestrator loads state from `.claude/memphis/.build-progress.json`
4. Orchestrator spawns specialized agents (designer, auditor, validator)
5. Agents execute tasks with checkpoint tracking
6. State saved on completion/interruption

### State Management
All migration work is tracked in `.claude/memphis/.build-progress.json`:
- Current phase (planning, migration, validation, cleanup)
- Completed tasks with timestamps
- Failed tasks with error details
- Resume capability from last checkpoint

### Reference Materials
- **Showcase pages**: 26 Designer Six pages in `.claude/memphis/showcase/`
- **Design principles**: `.claude/memphis/references/design-principles.md`
- **Component patterns**: `.claude/memphis/references/component-patterns.md`
- **Migration workflows**: `.claude/memphis/workflows/migration-workflow.md`

## Memphis UI Package

Components and utilities are in `packages/memphis-ui/`:
- React components: Button, Card, Badge, Input, Select, Modal, Table, Tabs
- Tailwind utilities: btn-coral, bg-teal, text-yellow, border-purple
- Theme configuration: Tailwind v4 CSS-based (@theme blocks)
- Hybrid approach: DaisyUI + custom Memphis components

## Agents

- **memphis-orchestrator**: Coordinates migration, manages state, spawns workers
- **memphis-designer**: Applies Memphis design patterns to components/pages
- **memphis-auditor**: Validates Memphis compliance, identifies violations

## Skills

- **migrate-page**: Migrate single page to Memphis design
- **extract-component**: Extract reusable component from showcase
- **validate-design**: Check Memphis design compliance
- **apply-theme**: Apply Memphis theme to existing component

## When to Use

- Migrating entire app to Memphis design
- Converting individual pages/components to Memphis
- Auditing code for Memphis compliance
- Extracting reusable patterns from showcase pages
- Validating Memphis design implementation

## Examples

```bash
# Migrate portal dashboard
/memphis:migrate apps/portal/src/app/dashboard/page.tsx

# Audit entire candidate app
/memphis:audit candidate

# Validate component
/memphis:validate apps/portal/src/components/JobCard.tsx

# Extract notification component from showcase
/memphis:extract notifications-ui
```

## Implementation

When invoked, this command:
1. Spawns memphis-orchestrator agent
2. Loads build progress state
3. Presents migration options to user
4. Coordinates specialized agents for execution
5. Saves checkpoints throughout process
6. Provides resume capability on interruption
