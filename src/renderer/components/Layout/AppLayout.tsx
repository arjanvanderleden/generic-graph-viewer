import type { ReactNode } from 'react';
import './AppLayout.css';

interface AppLayoutProps {
  graph: ReactNode;
  sidebar: ReactNode;
}

export function AppLayout({ graph, sidebar }: AppLayoutProps) {
  return (
    <div className="app-layout">
      <main className="app-layout__graph">{graph}</main>
      <aside className="app-layout__sidebar">{sidebar}</aside>
    </div>
  );
}
