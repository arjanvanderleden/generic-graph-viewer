# Testing Strategy

Guidelines for testing Generic Graph View.

## Testing Philosophy

1. **Test behavior, not implementation** - Tests should verify what the code does, not how it does it
2. **Prioritize critical paths** - Focus on data loading, validation, and core interactions
3. **Fast feedback** - Unit tests should run quickly
4. **Realistic scenarios** - Integration tests use real-world data patterns

## Test Types

### Unit Tests

Test individual functions and utilities in isolation.

**Scope**:
- Utility functions (`graphValidation.ts`, `categoryColors.ts`)
- Reducers (context reducers)
- Action creators
- Pure helper functions

**Example**:
```typescript
import { describe, it, expect } from 'vitest';
import { buildGraphIndex, getNodeById } from '../utils/graphValidation';

describe('buildGraphIndex', () => {
  it('creates index from graph data', () => {
    const graphData = {
      nodes: [{ id: 'n1', label: 'Node 1' }],
      edges: [{ sourceId: 'n1', targetId: 'n2' }]
    };

    const index = buildGraphIndex(graphData);

    expect(index.nodeById.get('n1')).toEqual(graphData.nodes[0]);
    expect(index.edgeByKey.has('n1|n2')).toBe(true);
  });
});
```

### Component Tests

Test React components with React Testing Library.

**Scope**:
- Component rendering
- User interactions
- State changes
- Context integration

**Example**:
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchInput } from '../components/Sidebar/SearchInput';

describe('SearchInput', () => {
  const mockNodes = [
    { id: '1', label: 'Alpha', category: 'A' },
    { id: '2', label: 'Beta', category: 'B' }
  ];

  it('filters nodes by search query', async () => {
    const onSelect = vi.fn();
    render(<SearchInput nodes={mockNodes} onNodeSelect={onSelect} />);

    const input = screen.getByPlaceholderText('Search nodes...');
    fireEvent.change(input, { target: { value: 'alpha' } });

    // Wait for debounce
    await screen.findByText('Alpha');
    expect(screen.queryByText('Beta')).not.toBeInTheDocument();
  });
});
```

### Integration Tests

Test component interactions and data flow.

**Scope**:
- Context + component integration
- Multi-component workflows
- IPC simulation

**Example**:
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { GraphProvider } from '../context/GraphContext';
import { SelectionProvider } from '../context/SelectionContext';
import { PropertyPanel } from '../components/Sidebar/PropertyPanel';

describe('PropertyPanel integration', () => {
  it('shows node details when selected', () => {
    const testGraph = {
      nodes: [{ id: '1', label: 'Test Node', category: 'Test' }],
      edges: []
    };

    render(
      <GraphProvider initialData={testGraph}>
        <SelectionProvider>
          <PropertyPanel />
        </SelectionProvider>
      </GraphProvider>
    );

    // Select node via context
    // Verify panel shows node details
  });
});
```

### E2E Tests (Playwright)

Full application testing with Electron.

**Scope**:
- File open/save
- Graph visualization
- Export functionality
- Menu actions

## Test File Organization

```
src/
├── renderer/
│   ├── components/
│   │   └── Sidebar/
│   │       ├── SearchInput.tsx
│   │       └── SearchInput.test.tsx
│   ├── context/
│   │   ├── GraphContext.tsx
│   │   └── GraphContext.test.tsx
│   └── utils/
│       ├── graphValidation.ts
│       └── graphValidation.test.ts
└── test/
    ├── fixtures/           # Test data
    ├── helpers/            # Test utilities
    └── e2e/               # E2E tests
```

## Testing Patterns

### Arrange-Act-Assert

```typescript
it('validates graph structure', () => {
  // Arrange
  const invalidData = { nodes: 'not-an-array' };

  // Act
  const result = validateGraphData(invalidData);

  // Assert
  expect(result.success).toBe(false);
  expect(result.error.message).toContain('nodes must be an array');
});
```

### Testing Reducers

```typescript
describe('graphReducer', () => {
  const initialState = {
    graphData: null,
    isLoading: false,
    error: null
  };

  it('handles LOAD_START', () => {
    const action = { type: 'LOAD_START' };
    const state = graphReducer(initialState, action);

    expect(state.isLoading).toBe(true);
    expect(state.error).toBe(null);
  });

  it('handles LOAD_SUCCESS', () => {
    const graphData = { nodes: [], edges: [] };
    const action = {
      type: 'LOAD_SUCCESS',
      payload: { graphData, index: {}, filePath: '/test.json' }
    };

    const state = graphReducer(initialState, action);

    expect(state.graphData).toEqual(graphData);
    expect(state.isLoading).toBe(false);
  });
});
```

### Testing Action Creators

```typescript
describe('graphActions', () => {
  it('creates LOAD_START action', () => {
    const action = graphActions.loadStart();
    expect(action).toEqual({ type: 'LOAD_START' });
  });

  it('creates SET_FORCE_PARAMS action', () => {
    const params = { linkDistance: 200 };
    const action = graphActions.setForceParams(params);

    expect(action).toEqual({
      type: 'SET_FORCE_PARAMS',
      payload: params
    });
  });
});
```

### Testing with Context

```typescript
// Test helper for wrapped components
function renderWithProviders(
  ui: React.ReactElement,
  { graphState, selectionState } = {}
) {
  return render(
    <GraphProvider testState={graphState}>
      <SelectionProvider testState={selectionState}>
        {ui}
      </SelectionProvider>
    </GraphProvider>
  );
}

it('renders with graph context', () => {
  renderWithProviders(<MyComponent />, {
    graphState: { graphData: testData }
  });
});
```

### Mocking IPC

```typescript
// Mock electronAPI
beforeEach(() => {
  window.electronAPI = {
    openFileDialog: vi.fn().mockResolvedValue({
      success: true,
      data: '{"nodes":[],"edges":[]}'
    }),
    onOpenFile: vi.fn().mockReturnValue(() => {}),
    onExportPng: vi.fn().mockReturnValue(() => {})
  };
});
```

## Test Data Fixtures

### Minimal Valid Graph

```typescript
export const minimalGraph = {
  nodes: [
    { id: 'n1', label: 'Node 1' }
  ],
  edges: []
};
```

### Graph with Categories

```typescript
export const categorizedGraph = {
  nodes: [
    { id: 'n1', label: 'Node 1', category: 'Type A' },
    { id: 'n2', label: 'Node 2', category: 'Type B' },
    { id: 'n3', label: 'Node 3', category: 'Type A' }
  ],
  edges: [
    { sourceId: 'n1', targetId: 'n2' }
  ]
};
```

### Graph with Properties

```typescript
export const richGraph = {
  nodes: [
    {
      id: 'n1',
      label: 'Rich Node',
      category: 'Type A',
      properties: {
        description: 'A node with properties',
        count: 42,
        active: true
      }
    }
  ],
  edges: [
    {
      sourceId: 'n1',
      targetId: 'n2',
      properties: {
        weight: 1.5,
        type: 'association'
      }
    }
  ]
};
```

## Coverage Goals

| Category | Target |
|----------|--------|
| Utility functions | 90%+ |
| Reducers | 90%+ |
| Components | 70%+ |
| Integration | Key flows |

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific file
npm test -- graphValidation.test.ts

# Run in watch mode
npm test -- --watch
```

## CI Integration

Tests run automatically on:
- Pull request creation
- Push to main branch
- Pre-commit hook (optional)

```yaml
# Example GitHub Actions
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
    - run: npm ci
    - run: npm test -- --coverage
```
