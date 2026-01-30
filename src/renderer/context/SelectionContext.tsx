import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch
} from 'react';
import type { SelectionState } from '../types/graph';

// State
const initialState: SelectionState = {
  type: null,
  ids: []
};

// Actions
type SelectionAction =
  | { type: 'SELECT_NODE'; payload: string }
  | { type: 'SELECT_NODES'; payload: string[] }
  | { type: 'ADD_NODES'; payload: string[] }
  | { type: 'REMOVE_NODES'; payload: string[] }
  | { type: 'TOGGLE_NODE'; payload: string }
  | { type: 'SELECT_EDGE'; payload: string }
  | { type: 'CLEAR_SELECTION' };

// Reducer
function selectionReducer(
  state: SelectionState,
  action: SelectionAction
): SelectionState {
  switch (action.type) {
    case 'SELECT_NODE':
      return {
        type: 'node',
        ids: [action.payload]
      };

    case 'SELECT_NODES':
      return {
        type: action.payload.length > 0 ? 'node' : null,
        ids: action.payload
      };

    case 'ADD_NODES': {
      if (action.payload.length === 0) return state;
      const currentIds = state.type === 'node' ? state.ids : [];
      const newIds = [...new Set([...currentIds, ...action.payload])];
      return {
        type: 'node',
        ids: newIds
      };
    }

    case 'REMOVE_NODES': {
      if (state.type !== 'node' || action.payload.length === 0) return state;
      const removeSet = new Set(action.payload);
      const remainingIds = state.ids.filter((id) => !removeSet.has(id));
      return {
        type: remainingIds.length > 0 ? 'node' : null,
        ids: remainingIds
      };
    }

    case 'TOGGLE_NODE': {
      if (state.type !== 'node') {
        return { type: 'node', ids: [action.payload] };
      }
      const exists = state.ids.includes(action.payload);
      const newIds = exists
        ? state.ids.filter((id) => id !== action.payload)
        : [...state.ids, action.payload];
      return {
        type: newIds.length > 0 ? 'node' : null,
        ids: newIds
      };
    }

    case 'SELECT_EDGE':
      return {
        type: 'edge',
        ids: [action.payload]
      };

    case 'CLEAR_SELECTION':
      return {
        type: null,
        ids: []
      };

    default:
      return state;
  }
}

// Context
interface SelectionContextValue {
  selection: SelectionState;
  dispatch: Dispatch<SelectionAction>;
}

const SelectionContext = createContext<SelectionContextValue | null>(null);

// Provider
interface SelectionProviderProps {
  children: ReactNode;
}

export function SelectionProvider({ children }: SelectionProviderProps) {
  const [selection, dispatch] = useReducer(selectionReducer, initialState);

  return (
    <SelectionContext.Provider value={{ selection, dispatch }}>
      {children}
    </SelectionContext.Provider>
  );
}

// Hook
export function useSelection() {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
}

// Action creators
export const selectionActions = {
  selectNode: (id: string): SelectionAction => ({
    type: 'SELECT_NODE',
    payload: id
  }),

  selectNodes: (ids: string[]): SelectionAction => ({
    type: 'SELECT_NODES',
    payload: ids
  }),

  addNodes: (ids: string[]): SelectionAction => ({
    type: 'ADD_NODES',
    payload: ids
  }),

  removeNodes: (ids: string[]): SelectionAction => ({
    type: 'REMOVE_NODES',
    payload: ids
  }),

  toggleNode: (id: string): SelectionAction => ({
    type: 'TOGGLE_NODE',
    payload: id
  }),

  selectEdge: (id: string): SelectionAction => ({
    type: 'SELECT_EDGE',
    payload: id
  }),

  clearSelection: (): SelectionAction => ({
    type: 'CLEAR_SELECTION'
  })
};

// Helper to generate edge ID from source and target
export function getEdgeId(sourceId: string, targetId: string): string {
  return `${sourceId}->${targetId}`;
}
