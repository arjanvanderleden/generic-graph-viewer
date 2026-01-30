import { ThemeToggle } from './ThemeToggle';
import './TitleBar.css';

interface TitleBarProps {
  title?: string;
}

export function TitleBar({ title }: TitleBarProps) {
  return (
    <div className="title-bar">
      <div className="title-bar__drag-region" />
      {title && <span className="title-bar__title">{title}</span>}
      <div className="title-bar__actions">
        <ThemeToggle />
      </div>
    </div>
  );
}
