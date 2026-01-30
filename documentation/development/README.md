# Development Documentation

This documentation is designed for developers working on Generic Graph View, with a focus on AI-assisted engineering workflows.

## Table of Contents

### Architecture & Design
1. [Architecture Overview](./architecture.md) - System design and component relationships
2. [Project Structure](./project-structure.md) - File organization and module boundaries
3. [State Management](./state-management.md) - Context, reducers, and data flow

### Development
4. [Development Setup](./development-setup.md) - Environment configuration and tooling
5. [Code Patterns](./code-patterns.md) - Conventions, patterns, and best practices
6. [Component Guide](./components.md) - React component documentation

### AI-Assisted Development
7. [AI Engineering Guide](./ai-engineering-guide.md) - Working with AI assistants
8. [Prompt Patterns](./prompt-patterns.md) - Effective prompts for this codebase
9. [AI Context Files](./ai-context-files.md) - Understanding CLAUDE.md and context

### Quality & Testing
10. [Testing Strategy](./testing.md) - Test patterns and coverage goals
11. [Code Review Checklist](./code-review.md) - Review guidelines

### Reference
12. [API Reference](./api-reference.md) - IPC, hooks, and utilities
13. [Troubleshooting Dev Issues](./troubleshooting-dev.md) - Common development problems

## Quick Start for AI-Assisted Development

When working with an AI assistant on this codebase:

1. **Share context files** - Point the AI to `CLAUDE.md` in the project root
2. **Explain the architecture** - Reference this documentation
3. **Use specific prompts** - See [Prompt Patterns](./prompt-patterns.md)
4. **Verify outputs** - Always run `npm run typecheck` after AI-generated code

## Key Principles

This codebase follows these principles that AI assistants should understand:

1. **TypeScript Strict Mode** - No `any` types, explicit return types
2. **Context + Reducer Pattern** - All state in contexts with dispatch actions
3. **Component Isolation** - UI logic stays in components, business logic in hooks/utils
4. **Ref-based Performance** - D3 simulation uses refs to avoid React re-renders
5. **IPC Boundaries** - Clear separation between main and renderer processes

## Technology Stack

| Layer | Technology |
|-------|------------|
| Desktop Runtime | Electron 28+ |
| Build Tool | electron-vite |
| UI Framework | React 18 |
| Language | TypeScript 5 (strict) |
| Visualization | D3.js 7 |
| Styling | CSS with CSS Variables |

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run typecheck    # Run TypeScript compiler
npm run preview      # Preview production build
```
