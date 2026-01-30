import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch
} from 'react';
import type { GraphData, GraphStats, GraphIndex, LoadedGraph } from '../types/graph';
import { calculateStats, buildGraphIndex } from '../utils/graphValidation';
import { FORCE_DEFAULTS } from '../config/constants';

// Force simulation parameters
export interface ForceParams {
  linkDistance: number;
  chargeStrength: number;
  collisionRadius: number;
}

const defaultForceParams: ForceParams = {
  linkDistance: FORCE_DEFAULTS.linkDistance,
  chargeStrength: FORCE_DEFAULTS.chargeStrength,
  collisionRadius: FORCE_DEFAULTS.collisionRadius
};

// State
interface GraphState {
  graphData: GraphData | null;
  graphIndex: GraphIndex | null;
  stats: GraphStats | null;
  filePath: string | null;
  isLoading: boolean;
  error: string | null;
  radialLayout: boolean;
  forceParams: ForceParams;
  hiddenCategories: Set<string>;
}

const initialState: GraphState = {
  graphData: null,
  graphIndex: null,
  stats: null,
  filePath: null,
  isLoading: false,
  error: null,
  radialLayout: false,
  forceParams: defaultForceParams,
  hiddenCategories: new Set()
};

// Actions
type GraphAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: LoadedGraph }
  | { type: 'LOAD_ERROR'; payload: string }
  | { type: 'CLEAR_GRAPH' }
  | { type: 'SET_RADIAL_LAYOUT'; payload: boolean }
  | { type: 'SET_FORCE_PARAMS'; payload: Partial<ForceParams> }
  | { type: 'TOGGLE_CATEGORY_VISIBILITY'; payload: string }
  | { type: 'SET_HIDDEN_CATEGORIES'; payload: Set<string> };

// Reducer
function graphReducer(state: GraphState, action: GraphAction): GraphState {
  switch (action.type) {
    case 'LOAD_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case 'LOAD_SUCCESS':
      return {
        ...state,
        graphData: action.payload.data,
        graphIndex: action.payload.index,
        stats: action.payload.stats,
        filePath: action.payload.filePath,
        isLoading: false,
        error: null,
        hiddenCategories: new Set()
      };

    case 'LOAD_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };

    case 'CLEAR_GRAPH':
      return {
        ...initialState
      };

    case 'SET_RADIAL_LAYOUT':
      return {
        ...state,
        radialLayout: action.payload
      };

    case 'SET_FORCE_PARAMS':
      return {
        ...state,
        forceParams: { ...state.forceParams, ...action.payload }
      };

    case 'TOGGLE_CATEGORY_VISIBILITY': {
      const newHidden = new Set(state.hiddenCategories);
      if (newHidden.has(action.payload)) {
        newHidden.delete(action.payload);
      } else {
        newHidden.add(action.payload);
      }
      return {
        ...state,
        hiddenCategories: newHidden
      };
    }

    case 'SET_HIDDEN_CATEGORIES':
      return {
        ...state,
        hiddenCategories: action.payload
      };

    default:
      return state;
  }
}

// Context
interface GraphContextValue {
  state: GraphState;
  dispatch: Dispatch<GraphAction>;
}

const GraphContext = createContext<GraphContextValue | null>(null);

// Provider
interface GraphProviderProps {
  children: ReactNode;
}

export function GraphProvider({ children }: GraphProviderProps) {
  const [state, dispatch] = useReducer(graphReducer, initialState);

  return (
    <GraphContext.Provider value={{ state, dispatch }}>
      {children}
    </GraphContext.Provider>
  );
}

// Hook
export function useGraph() {
  const context = useContext(GraphContext);
  if (!context) {
    throw new Error('useGraph must be used within a GraphProvider');
  }
  return context;
}

// Action creators
export const graphActions = {
  loadStart: (): GraphAction => ({ type: 'LOAD_START' }),

  loadSuccess: (data: GraphData, filePath: string): GraphAction => ({
    type: 'LOAD_SUCCESS',
    payload: {
      data,
      filePath,
      index: buildGraphIndex(data),
      stats: calculateStats(data)
    }
  }),

  loadError: (error: string): GraphAction => ({
    type: 'LOAD_ERROR',
    payload: error
  }),

  clearGraph: (): GraphAction => ({ type: 'CLEAR_GRAPH' }),

  setRadialLayout: (enabled: boolean): GraphAction => ({
    type: 'SET_RADIAL_LAYOUT',
    payload: enabled
  }),

  setForceParams: (params: Partial<ForceParams>): GraphAction => ({
    type: 'SET_FORCE_PARAMS',
    payload: params
  }),

  toggleCategoryVisibility: (category: string): GraphAction => ({
    type: 'TOGGLE_CATEGORY_VISIBILITY',
    payload: category
  }),

  setHiddenCategories: (categories: Set<string>): GraphAction => ({
    type: 'SET_HIDDEN_CATEGORIES',
    payload: categories
  })
};
