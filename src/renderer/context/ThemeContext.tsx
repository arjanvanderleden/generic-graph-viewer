import { createContext, useContext, useReducer, useEffect, type ReactNode, type Dispatch } from 'react';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
}

type ThemeAction = { type: 'SET_THEME'; payload: Theme } | { type: 'TOGGLE_THEME' };

function themeReducer(state: ThemeState, action: ThemeAction): ThemeState {
  switch (action.type) {
    case 'SET_THEME':
      return { theme: action.payload };
    case 'TOGGLE_THEME':
      return { theme: state.theme === 'light' ? 'dark' : 'light' };
    default:
      return state;
  }
}

interface ThemeContextValue {
  state: ThemeState;
  dispatch: Dispatch<ThemeAction>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const themeActions = {
  setTheme: (theme: Theme): ThemeAction => ({ type: 'SET_THEME', payload: theme }),
  toggleTheme: (): ThemeAction => ({ type: 'TOGGLE_THEME' })
};

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Try to get saved theme preference from localStorage
  const savedTheme = typeof localStorage !== 'undefined'
    ? (localStorage.getItem('theme') as Theme | null)
    : null;

  const [state, dispatch] = useReducer(themeReducer, {
    theme: savedTheme || 'light'
  });

  // Apply theme to document and persist
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
    localStorage.setItem('theme', state.theme);
  }, [state.theme]);

  return (
    <ThemeContext.Provider value={{ state, dispatch }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
