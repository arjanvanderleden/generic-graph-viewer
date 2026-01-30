# Prompt Patterns

Effective prompts for AI-assisted development on this codebase.

## Core Prompt Structure

```markdown
[Context] - What exists now
[Goal] - What you want to achieve
[Constraints] - Patterns to follow, things to avoid
[Examples] - Reference files or code snippets
```

---

## Component Prompts

### New Component

```markdown
Create a React component called [ComponentName].

Location: src/renderer/components/[Category]/[ComponentName].tsx

Purpose: [What the component does]

Props:
- [propName]: [type] - [description]

State from context:
- useGraph(): [what it needs]
- useSelection(): [what it needs]

Behavior:
- [List user interactions and responses]

Follow the pattern in [ReferenceComponent].tsx.
Create a separate [ComponentName].css file for styles.
Use CSS variables for colors (see index.css).
```

### Modify Component

```markdown
Modify [ComponentName] in [path].

Current behavior: [What it does now]

Desired behavior: [What it should do]

Specific changes:
1. [Change 1]
2. [Change 2]

Preserve:
- [Existing behavior to keep]
- [Patterns to maintain]
```

### Component with Modal

```markdown
Add a modal dialog triggered from [ComponentName].

Modal should:
- Open when [trigger condition]
- Display [content description]
- Close on Escape key and backdrop click
- Have [action buttons]

Follow the pattern in NodePropertiesModal.tsx.
Use CSS class .modal-overlay for backdrop.
```

---

## State Management Prompts

### Add State Field

```markdown
Add state to GraphContext:

Field: [fieldName]: [TypeName]
Initial value: [value]
Purpose: [Why this state exists]

Actions needed:
- SET_[FIELD]: Set the value directly
- [Other actions if needed]

Update graphReducer to handle the new actions.
Add action creators to graphActions object.
```

### Add Computed Value

```markdown
Add a computed value to [Component]:

Computation: [What to compute]
Inputs: [State/props it depends on]
Output type: [TypeName]

Use useMemo with appropriate dependencies.
Example: see selectedNodes in PropertyPanel.tsx
```

### Cross-Context Coordination

```markdown
When [event in ContextA], update [ContextB].

Current:
- ContextA handles [action]
- ContextB is independent

Desired:
- When [action] in ContextA, trigger [effect] in ContextB

Handle this in a component/hook that has access to both contexts.
See useGraphLoader.ts for pattern (clears selection on graph change).
```

---

## D3 Integration Prompts

### Modify Force Simulation

```markdown
Adjust the D3 force simulation in useForceGraph.ts:

Current forces: [list current forces]

Change: [What to modify]

Constraints:
- Use refs for node/link data (not state)
- Batch updates with requestAnimationFrame
- Clean up simulation on unmount
```

### Add Visual Effect

```markdown
Add visual effect to graph nodes/edges:

Effect: [Description, e.g., "pulse animation on selection"]

Apply to: [nodes/edges matching condition]

Implementation:
- CSS animation preferred over D3 transitions
- Add class via conditional rendering
- Define animation in GraphCanvas.css
```

### Add Interaction

```markdown
Add interaction to GraphCanvas:

Trigger: [e.g., "double-click on node"]
Action: [What should happen]

Consider:
- Event handler on SVG element
- Access to D3Node data via datum
- Dispatch to appropriate context
- Keyboard modifier handling (Cmd/Ctrl)
```

---

## IPC Prompts

### New IPC Handler

```markdown
Add IPC channel: [channel:name]

Direction: renderer → main (invoke/handle)

Request payload: [TypeName or description]
Response payload: [TypeName or description]

Implementation:
1. src/main/index.ts: ipcMain.handle('[channel:name]', ...)
2. src/preload/index.ts: Add to ElectronAPI interface and object
3. Usage: await window.electronAPI.[methodName](args)

Main process logic:
[What the handler should do]
```

### Menu-Triggered Action

```markdown
Add menu item that triggers renderer action:

Menu location: [File/Edit/View/etc]
Label: "[Menu Item Name]"
Shortcut: [Cmd+Key]

Flow:
1. menu.ts: Add item with click → webContents.send('[channel]')
2. preload.ts: Add on[EventName] listener wrapper
3. useGraphLoader.ts: Register handler with ref pattern

Handler should: [What it does in renderer]
```

---

## Styling Prompts

### Theme-Aware Styles

```markdown
Add styles for [component/feature]:

Requirements:
- Work in both light and dark themes
- Use CSS variables from index.css
- Match existing visual language

Variables to use:
- --background, --surface for backgrounds
- --text, --text-secondary for text
- --border for borders
- --primary for accent colors

Create [Component].css with scoped class names.
```

### Responsive Layout

```markdown
Make [component] responsive:

Current: [Fixed dimensions/layout]
Desired: [How it should adapt]

Use:
- CSS Grid/Flexbox (no fixed widths)
- Container-relative units
- CSS variables for spacing
```

---

## Testing Prompts

### Unit Test

```markdown
Write unit tests for [function/component]:

File: [path to source]
Test file: [path].test.ts

Test cases:
1. [Happy path]
2. [Edge case]
3. [Error case]

Use Vitest syntax.
Mock dependencies as needed.
Follow Arrange-Act-Assert pattern.
```

### Integration Test

```markdown
Write integration test for [feature]:

Scenario: [User flow to test]

Setup:
- [Required state/mocks]

Steps:
1. [Action]
2. [Verification]
3. [Action]
4. [Verification]

Use React Testing Library patterns.
```

---

## Debugging Prompts

### Diagnose Issue

```markdown
Debug this issue:

Symptom: [What's happening]
Expected: [What should happen]
Reproduction: [Steps to reproduce]

Error message (if any):
```
[paste error]
```

Relevant files:
- [file1.ts]
- [file2.ts]

What I've tried:
- [Attempt 1]
- [Attempt 2]
```

### Performance Issue

```markdown
Investigate performance issue:

Symptom: [Slow render, high CPU, etc.]
When: [Trigger condition]

Suspected areas:
- [Component/function]

Provide:
1. Analysis of potential causes
2. Profiling suggestions
3. Optimization options
```

---

## Refactoring Prompts

### Extract Function

```markdown
Extract function from [Component/File]:

Current code location: [file:lines]

New function:
- Name: [functionName]
- Location: [file path]
- Parameters: [list]
- Return type: [type]

Purpose: [What it does, why extract]
```

### Consolidate Duplicates

```markdown
Consolidate duplicate code:

Locations:
1. [file1:lines]
2. [file2:lines]

Create shared utility in:
[path/file.ts]

Function signature:
[name]([params]): [return type]
```

### Improve Types

```markdown
Improve TypeScript types in [file]:

Current issues:
- [Type issue 1]
- [Type issue 2]

Goals:
- Remove any types
- Add explicit return types
- Use strict mode patterns

Reference: [Similar well-typed file]
```

---

## Documentation Prompts

### Document Function

```markdown
Add JSDoc to function in [file]:

Function: [name]
Purpose: [What it does]

Document:
- @param for each parameter
- @returns description
- @throws if applicable
- @example usage
```

### Explain Code

```markdown
Explain this code section:

File: [path]
Lines: [start-end]

Questions:
1. What is the purpose?
2. Why is it implemented this way?
3. What are the key patterns used?
```

---

## Quick Reference

| Task | Key Elements to Include |
|------|------------------------|
| New Component | Location, props, context needs, reference file |
| State Change | Field, type, actions, initial value |
| IPC Handler | Channel, payloads, all three files |
| Styling | Theme variables, both themes, scoped classes |
| Debug | Symptom, expected, repro, error, what tried |
| Refactor | Current location, new location, purpose |
