# AI Engineering Guide

This guide explains how to effectively use AI assistants when developing Generic Graph View.

## Overview

AI assistants excel at:
- Understanding existing patterns and replicating them
- Generating boilerplate code following established conventions
- Explaining complex code sections
- Suggesting improvements and catching issues
- Writing tests and documentation

AI assistants need guidance with:
- Architectural decisions (human review required)
- Performance-critical code (validate claims)
- Security-sensitive implementations (always review)
- Novel algorithms (verify correctness)

## Getting Started with AI-Assisted Development

### 1. Share Context Files

Point the AI to key files in this order:

```
1. CLAUDE.md              # Project context and conventions
2. documentation/         # Architecture and patterns
3. Relevant source files  # Code being modified
```

### 2. Explain Current State

Before making changes:
```
"The current implementation of X uses Y pattern.
I want to add Z feature. The relevant files are..."
```

### 3. Be Specific About Scope

```
# ❌ Too vague
"Fix the graph component"

# ✅ Specific
"In GraphCanvas.tsx, the edge rendering doesn't handle
duplicate edges between the same nodes. Each edge needs
a unique key that includes an index."
```

## Working with This Codebase

### Understanding the Architecture

When working on this codebase, understand these key patterns:

**1. Context + Reducer Pattern**
```typescript
// State lives in contexts
const { state, dispatch } = useGraph();

// Changes via actions
dispatch(graphActions.setForceParams({ linkDistance: 200 }));
```

**2. Refs for Performance**
```typescript
// D3 data in refs to avoid re-renders
const nodesRef = useRef<D3Node[]>([]);

// React state only when UI needs update
const [, forceRender] = useReducer(x => x + 1, 0);
```

**3. IPC Boundaries**
```typescript
// Renderer calls preload API
await window.electronAPI.openFileDialog();

// Never direct Node.js access
// ❌ import fs from 'fs';
```

### Prompting for This Codebase

**Adding a new component:**
```
Create a new component called [Name] in src/renderer/components/[Category]/.
It should:
- Follow the existing component pattern (see GraphStats.tsx)
- Use CSS from a separate [Name].css file
- Get state from useGraph() context
- Dispatch actions for state changes

The component should [describe functionality].
```

**Adding to context:**
```
Add a new piece of state to GraphContext:
- State field: [name]: [type]
- Action: [ACTION_NAME] with payload [type]
- Action creator: [name]([params]): GraphAction

Follow the existing pattern in GraphContext.tsx.
```

**Adding an IPC handler:**
```
Add a new IPC channel called [channel:name]:
1. Handler in src/main/index.ts
2. Type and method in src/preload/index.ts ElectronAPI
3. Usage example in renderer

The handler should [describe what it does].
```

## AI-Assisted Workflows

### Feature Development

```
1. Describe the feature and desired outcome
2. Ask AI to identify affected files
3. Review the proposed approach
4. Have AI implement incrementally
5. Test each increment
6. Run typecheck before committing
```

### Bug Fixing

```
1. Describe the bug with reproduction steps
2. Share relevant error messages/logs
3. Ask AI to analyze potential causes
4. Review suggested fixes
5. Implement the fix
6. Verify the bug is resolved
```

### Refactoring

```
1. Explain current code and its issues
2. Describe the desired end state
3. Ask AI to propose refactoring steps
4. Execute incrementally with tests
5. Ensure backwards compatibility
```

### Code Review

```
1. Share the code to review
2. Ask for specific feedback:
   - TypeScript best practices
   - React patterns
   - Performance concerns
   - Security issues
3. Discuss suggestions
4. Implement improvements
```

## Common Tasks

### Adding a New Sidebar Section

```markdown
I need to add a new sidebar section for [purpose].

Current sidebar structure is in src/renderer/components/Sidebar/Sidebar.tsx.
Each section is a separate component with its own CSS.

The new section should:
- [List requirements]
- [Data it needs from context]
- [User interactions it supports]

Follow the pattern of GraphStats.tsx for reference.
```

### Adding a Context Action

```markdown
Add a new action to [Graph/Selection]Context:

Action name: [ACTION_NAME]
Payload type: [TypeDefinition]
State changes: [Describe what changes in state]

Example usage:
dispatch(actions.actionName(payload));

Follow the existing action pattern in the context file.
```

### Adding a Keyboard Shortcut

```markdown
Add a keyboard shortcut for [action]:
- Keys: [e.g., Cmd+Shift+S]
- Action: [What it should do]

This requires:
1. Menu item in src/main/menu.ts with accelerator
2. IPC event emission to renderer
3. Handler registration in useGraphLoader.ts
```

## Validation Checklist

After AI generates code, always verify:

```bash
# TypeScript compiles
npm run typecheck

# Application starts
npm run dev

# Test the specific feature
# [Manual testing steps]
```

### Code Quality Checks

- [ ] No `any` types (TypeScript strict mode)
- [ ] Explicit return types on public functions
- [ ] Action creators used (not inline objects)
- [ ] Refs used for D3 data (not state)
- [ ] CSS in separate file (not inline)
- [ ] Constants in config/constants.ts

### Security Checks

- [ ] No Node.js APIs in renderer
- [ ] IPC uses explicit channels
- [ ] User input validated
- [ ] File paths sanitized

## Troubleshooting AI Output

### AI Suggests Node.js in Renderer
```
"Use fs.readFileSync to read the file..."
```

**Fix**: Explain the Electron process model. File operations must go through IPC handlers in the main process.

### AI Creates Inline Styles
```typescript
<div style={{ color: 'red' }}>
```

**Fix**: Request CSS file with CSS variables for theming.

### AI Uses useState for D3 Data
```typescript
const [nodes, setNodes] = useState<D3Node[]>([]);
```

**Fix**: Explain the performance pattern - D3 data goes in refs.

### AI Forgets Action Creators
```typescript
dispatch({ type: 'LOAD_SUCCESS', payload: data });
```

**Fix**: Request use of action creators for type safety.

## Best Practices

### 1. Incremental Changes
Ask for changes in small, testable increments rather than large rewrites.

### 2. Preserve Patterns
When adding new code, ask AI to follow existing patterns explicitly.

### 3. Verify Understanding
Ask AI to explain its approach before implementing.

### 4. Test Immediately
Run `npm run dev` after each significant change.

### 5. Review Generated Tests
AI-generated tests may miss edge cases. Review and augment.

### 6. Document Decisions
When AI suggests multiple approaches, document why you chose one.

## Example Session

```markdown
User: I need to add a feature to highlight all nodes connected
to the selected node.

AI: I'll help you add connected node highlighting. Let me understand
the current selection system first.

[AI reads SelectionContext.tsx and GraphCanvas.tsx]

AI: I see the selection is managed in SelectionContext with node IDs.
GraphCanvas renders nodes and checks selection state. Here's my approach:

1. Add a computed property for connected nodes in GraphCanvas
2. Use the graphIndex to find edges involving selected nodes
3. Add a CSS class for connected node highlighting

Should I proceed with this approach?

User: Yes, proceed.

AI: [Implements the feature following existing patterns]

User: npm run typecheck
[Output shows no errors]

User: npm run dev
[Tests the feature manually]
```

## Resources

- [Architecture Overview](./architecture.md) - System design
- [Code Patterns](./code-patterns.md) - Conventions to follow
- [Prompt Patterns](./prompt-patterns.md) - Effective prompts
- [AI Context Files](./ai-context-files.md) - CLAUDE.md guide
