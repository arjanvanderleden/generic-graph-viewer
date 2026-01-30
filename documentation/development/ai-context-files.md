# AI Context Files

Understanding and using context files for AI-assisted development.

## Overview

Context files provide AI assistants with essential project knowledge. They enable the AI to:
- Understand project conventions
- Follow established patterns
- Make appropriate architectural decisions
- Avoid common mistakes

## CLAUDE.md

The primary context file is `CLAUDE.md` in the project root.

### Purpose

CLAUDE.md contains:
1. Project overview and architecture
2. Technology stack
3. Key conventions and patterns
4. Important do's and don'ts
5. Common operations and commands

### Structure

```markdown
# Project Name

Brief description

## Technology Stack
- List of technologies

## Architecture
- Key architectural patterns

## Conventions
- Coding standards
- File organization
- Naming conventions

## Key Patterns
- Important code patterns with examples

## Commands
- Development commands
- Build commands

## Do's and Don'ts
- What to do
- What to avoid
```

### This Project's CLAUDE.md

Key sections in this project's context file:

**Technology Stack**
- Electron + React + TypeScript + D3.js
- Context + Reducer state management
- CSS variables for theming

**Key Patterns**
- Refs for D3 performance
- Action creators for state changes
- IPC through preload API

**Conventions**
- TypeScript strict mode
- Explicit return types
- Scoped CSS files

## How AI Uses Context

### At Session Start

The AI reads CLAUDE.md to understand:
1. What technologies are in use
2. What patterns to follow
3. What mistakes to avoid

### During Development

The AI references context to:
- Match existing code style
- Use appropriate patterns
- Suggest compatible solutions

### Example Impact

Without context:
```typescript
// AI might suggest
const [nodes, setNodes] = useState([]);
```

With context (knows about D3 performance pattern):
```typescript
// AI suggests
const nodesRef = useRef<D3Node[]>([]);
```

## Updating CLAUDE.md

### When to Update

Update CLAUDE.md when:
- Adding new major features
- Introducing new patterns
- Changing conventions
- Adding new technologies

### What to Include

**Do include:**
- Critical patterns AI must follow
- Common mistakes to avoid
- Key architectural decisions
- Important file locations

**Don't include:**
- Implementation details that change often
- Documentation that exists elsewhere
- Obvious conventions

### Example Update

Adding a new pattern:
```markdown
## IPC Listener Pattern

When adding IPC listeners in hooks:
1. Use refs for handlers to stay current
2. Register listeners once (empty deps)
3. Call ref.current in listener

```typescript
const handlerRef = useRef(handler);
useEffect(() => { handlerRef.current = handler; }, [handler]);

useEffect(() => {
  return window.electronAPI.onEvent(() => handlerRef.current());
}, []); // Empty deps
```
```

## Supplementary Context

### Documentation as Context

Point AI to relevant documentation:
```
See documentation/development/architecture.md for the system design.
Follow patterns in documentation/development/code-patterns.md.
```

### Source Files as Context

Reference existing implementations:
```
Follow the component pattern in src/renderer/components/Sidebar/GraphStats.tsx.
Use the action creator pattern from src/renderer/context/GraphContext.tsx.
```

### Inline Context

Provide context in prompts:
```
This project uses the Context + Reducer pattern (not Redux).
State lives in contexts and changes via dispatch(action).
See GraphContext.tsx for the pattern.
```

## Session Context

### Building Context During Session

As you work with AI, context builds:

1. **Initial context**: CLAUDE.md + prompt
2. **Reading files**: AI learns from code
3. **Your feedback**: Corrections refine understanding
4. **Iterations**: Patterns become clearer

### Maintaining Context

Keep AI on track:
```
Remember, we use refs for D3 data, not state.
Follow the existing pattern in useForceGraph.ts.
```

### Context Refresh

For long sessions or new topics:
```
Let me refresh context on the state management.
GraphContext handles: graphData, settings, forceParams.
SelectionContext handles: selected nodes/edges.
```

## Best Practices

### 1. Start with CLAUDE.md

Always point AI to CLAUDE.md at session start.

### 2. Reference Documentation

Link to relevant docs for complex topics.

### 3. Show Examples

Point to existing code that demonstrates patterns.

### 4. Correct Misunderstandings

If AI deviates from patterns, redirect:
```
That's not how we handle IPC in this project.
See the pattern in useGraphLoader.ts lines 45-60.
```

### 5. Update Context Files

When patterns evolve, update CLAUDE.md.

## Checklist for New Sessions

```markdown
[ ] Share CLAUDE.md location
[ ] Explain current task context
[ ] Point to relevant source files
[ ] Mention any special considerations
[ ] Verify AI understands before proceeding
```

## Example Session Start

```markdown
User: I'm working on Generic Graph View. The context file is
in CLAUDE.md at the project root.

I need to add a feature to export the graph as PNG.
This will need:
1. Menu item in main process
2. IPC handler
3. Export function in GraphCanvas

Key files:
- src/main/menu.ts (menu definition)
- src/main/index.ts (IPC handlers)
- src/preload/index.ts (API bridge)
- src/renderer/components/Graph/GraphCanvas.tsx

Please review these files and propose an approach.
```

This provides:
- Context file location
- Clear goal
- Affected files
- Request for plan before implementation
