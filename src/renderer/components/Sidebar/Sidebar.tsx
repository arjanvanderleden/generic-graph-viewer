import { useState, type ReactNode } from 'react';
import './Sidebar.css';

interface SidebarProps {
  children: ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  return (
    <div className="sidebar">
      <div className="sidebar__content">{children}</div>
    </div>
  );
}

interface SidebarSectionProps {
  title: string;
  children: ReactNode;
  defaultCollapsed?: boolean;
}

export function SidebarSection({ title, children, defaultCollapsed = false }: SidebarSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <section className="sidebar__section">
      <button
        className="sidebar__section-header"
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-expanded={!isCollapsed}
      >
        <span className={`sidebar__section-chevron ${isCollapsed ? 'sidebar__section-chevron--collapsed' : ''}`}>
          &#9662;
        </span>
        <h3 className="sidebar__section-title">{title}</h3>
      </button>
      {!isCollapsed && (
        <div className="sidebar__section-content">{children}</div>
      )}
    </section>
  );
}
