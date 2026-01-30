import { useState, useEffect } from 'react';
import { GraphProvider, useGraph } from './context/GraphContext';
import { SelectionProvider } from './context/SelectionContext';
import { ThemeProvider } from './context/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TitleBar } from './components/Layout/TitleBar';
import { AppLayout } from './components/Layout/AppLayout';
import { GraphCanvas } from './components/Graph/GraphCanvas';
import { Sidebar, SidebarSection } from './components/Sidebar/Sidebar';
import { SearchInput } from './components/Sidebar/SearchInput';
import { GraphStats } from './components/Sidebar/GraphStats';
import { CategoryLegend } from './components/Sidebar/CategoryLegend';
import { PropertyPanel } from './components/Sidebar/PropertyPanel';
import { LayoutSettingsModal } from './components/Layout/LayoutSettingsModal';
import { useGraphLoader } from './hooks/useGraphLoader';
import './App.css';

function AppContent() {
  const { error } = useGraphLoader();
  const { state } = useGraph();
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);

  // Listen for menu command to open layout settings
  useEffect(() => {
    const cleanup = window.electronAPI.onOpenLayoutSettings(() => {
      setIsLayoutModalOpen(true);
    });
    return cleanup;
  }, []);

  // Extract filename for title bar
  const fileName = state.filePath ? state.filePath.split('/').pop() : undefined;

  return (
    <div className="app">
      <TitleBar title={fileName} />
      {error && (
        <div className="app__error">
          <span>Error: {error}</span>
        </div>
      )}
      <AppLayout
        graph={<GraphCanvas />}
        sidebar={
          <Sidebar>
            <SearchInput />
            <SidebarSection title="Statistics">
              <GraphStats />
            </SidebarSection>
            <SidebarSection title="Categories">
              <CategoryLegend />
            </SidebarSection>
            <SidebarSection title="Properties">
              <PropertyPanel />
            </SidebarSection>
          </Sidebar>
        }
      />
      <LayoutSettingsModal
        isOpen={isLayoutModalOpen}
        onClose={() => setIsLayoutModalOpen(false)}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <GraphProvider>
        <SelectionProvider>
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </SelectionProvider>
      </GraphProvider>
    </ThemeProvider>
  );
}

export default App;
