# Development Setup

How to set up your development environment for Generic Graph View.

## Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 18+ | Runtime |
| npm | 9+ | Package manager |
| Git | 2.30+ | Version control |

### Recommended Tools

| Tool | Purpose |
|------|---------|
| VS Code | IDE with TypeScript support |
| React Developer Tools | Browser extension for debugging |

## Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd generic-graph-view
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

This starts:
- Vite dev server for renderer (hot reload)
- Electron main process (auto-restart on changes)
- Preload script compilation

## Development Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development mode |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run typecheck` | Run TypeScript compiler |

## Project Configuration

### TypeScript (tsconfig.json)

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "jsx": "react-jsx"
  }
}
```

Key settings:
- **strict**: Enables all strict type checks
- **noImplicitAny**: No implicit `any` types
- **strictNullChecks**: Explicit null handling

### Electron-Vite (electron.vite.config.ts)

Configures three build targets:
- **main**: Node.js environment for main process
- **preload**: Node.js environment with browser globals
- **renderer**: Browser environment with React

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "electron-vite dev",
    "build": "electron-vite build",
    "preview": "electron-vite preview",
    "typecheck": "tsc --noEmit"
  }
}
```

## VS Code Setup

### Recommended Extensions

```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss"
  ]
}
```

### Settings

```json
// .vscode/settings.json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

### Debug Configuration

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Main Process",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}",
      "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron",
      "args": [".", "--remote-debugging-port=9222"],
      "sourceMaps": true
    }
  ]
}
```

## Development Workflow

### 1. Start Dev Server

```bash
npm run dev
```

### 2. Make Changes

- **Renderer changes**: Hot reload (instant)
- **Main process changes**: Auto restart
- **Preload changes**: Auto restart

### 3. Type Check

```bash
npm run typecheck
```

Run before committing to catch type errors.

### 4. Test with Sample Data

Load files from `test-data/` folder:
- `software-architecture.json` - 48 nodes
- `social-network.json` - 169 nodes
- `package-dependencies.json` - 91 nodes
- `knowledge-graph.json` - 123 nodes

## Troubleshooting Setup

### "Cannot find module" Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### TypeScript Errors on Fresh Clone

```bash
# Ensure TypeScript sees all files
npm run typecheck
```

### Electron Won't Start

Check Node.js version:
```bash
node --version  # Should be 18+
```

### Hot Reload Not Working

1. Check Vite dev server is running
2. Check browser console for errors
3. Try hard refresh (Cmd+Shift+R)

## Environment Notes

### macOS

No special setup required. Use Cmd key for shortcuts.

### Windows

- Use Ctrl instead of Cmd for shortcuts
- Git may need line ending configuration:
  ```bash
  git config core.autocrlf input
  ```

### Linux

May need additional dependencies for Electron:
```bash
# Debian/Ubuntu
sudo apt install libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libpango-1.0-0 libcairo2 libasound2
```

## Next Steps

- Read [Architecture Overview](./architecture.md)
- Review [Code Patterns](./code-patterns.md)
- Explore [Component Guide](./components.md)
