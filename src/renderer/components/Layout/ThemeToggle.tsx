import { useTheme, themeActions } from '../../context/ThemeContext';
import './ThemeToggle.css';

export function ThemeToggle() {
  const { state, dispatch } = useTheme();
  const isDark = state.theme === 'dark';

  return (
    <button
      className="theme-toggle"
      onClick={() => dispatch(themeActions.toggleTheme())}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="theme-toggle__icon">
        {isDark ? '☀️' : '🌙'}
      </span>
    </button>
  );
}
