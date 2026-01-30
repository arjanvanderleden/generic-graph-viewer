import { useCallback, useEffect, useRef } from 'react';
import { useGraph, graphActions } from '../context/GraphContext';
import { useSelection, selectionActions } from '../context/SelectionContext';
import { validateGraphData } from '../utils/graphValidation';
import type { GraphData } from '../types/graph';

type ParseResult =
  | { success: true; data: GraphData }
  | { success: false; error: string };

/**
 * Shared logic for parsing and validating graph JSON
 */
function parseAndValidateGraph(content: string): ParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return { success: false, error: 'Invalid JSON file' };
  }

  const validation = validateGraphData(parsed);
  if (!validation.success) {
    return { success: false, error: validation.error.message };
  }

  return { success: true, data: validation.data };
}

/**
 * Hook for loading graph data from files via Electron IPC
 */
export function useGraphLoader() {
  const { state, dispatch } = useGraph();
  const { dispatch: selectionDispatch } = useSelection();
  const filePathRef = useRef(state.filePath);
  const dispatchRef = useRef(dispatch);

  // Keep refs in sync
  useEffect(() => {
    filePathRef.current = state.filePath;
    dispatchRef.current = dispatch;
  }, [state.filePath, dispatch]);

  // Clear selection when graph data changes
  useEffect(() => {
    selectionDispatch(selectionActions.clearSelection());
  }, [state.graphData, selectionDispatch]);

  /**
   * Opens file dialog and loads the selected file
   */
  const openFile = useCallback(async () => {
    dispatch(graphActions.loadStart());

    try {
      const result = await window.electronAPI.openFileDialog();

      if (!result) {
        // User cancelled
        dispatch(graphActions.loadError(''));
        return;
      }

      if ('error' in result) {
        dispatch(graphActions.loadError(result.error));
        return;
      }

      const parsed = parseAndValidateGraph(result.content);
      if (!parsed.success) {
        dispatch(graphActions.loadError(parsed.error));
        return;
      }

      dispatch(graphActions.loadSuccess(parsed.data, result.filePath));
    } catch (error) {
      dispatch(
        graphActions.loadError(
          error instanceof Error ? error.message : 'Unknown error'
        )
      );
    }
  }, [dispatch]);

  /**
   * Loads a file from a specific path (for recent files)
   */
  const openFilePath = useCallback(
    async (filePath: string) => {
      dispatch(graphActions.loadStart());

      try {
        const result = await window.electronAPI.openFilePath(filePath);

        if (!result) {
          dispatch(graphActions.loadError('Failed to open file'));
          return;
        }

        if ('error' in result) {
          dispatch(graphActions.loadError(result.error));
          return;
        }

        const parsed = parseAndValidateGraph(result.content);
        if (!parsed.success) {
          dispatch(graphActions.loadError(parsed.error));
          return;
        }

        dispatch(graphActions.loadSuccess(parsed.data, result.filePath));
      } catch (error) {
        dispatch(
          graphActions.loadError(
            error instanceof Error ? error.message : 'Unknown error'
          )
        );
      }
    },
    [dispatch]
  );

  /**
   * Reloads the current document, or loads most recent if no document is open
   */
  const reloadDocument = useCallback(async () => {
    if (filePathRef.current) {
      openFilePath(filePathRef.current);
    } else {
      // No document loaded - try to load most recent
      const recentFiles = await window.electronAPI.getRecentFiles();
      if (recentFiles.length > 0) {
        openFilePath(recentFiles[0]);
      }
    }
  }, [openFilePath]);

  /**
   * Clears the current graph
   */
  const clearGraph = useCallback(() => {
    dispatch(graphActions.clearGraph());
  }, [dispatch]);

  // Keep handler refs updated
  const openFileRef = useRef(openFile);
  const openFilePathRef = useRef(openFilePath);
  const reloadDocumentRef = useRef(reloadDocument);

  useEffect(() => {
    openFileRef.current = openFile;
    openFilePathRef.current = openFilePath;
    reloadDocumentRef.current = reloadDocument;
  }, [openFile, openFilePath, reloadDocument]);

  // Listen for menu events - registered once, uses refs for current handlers
  useEffect(() => {
    const unsubscribeOpen = window.electronAPI.onOpenFile(() => {
      openFileRef.current();
    });

    const unsubscribeRecent = window.electronAPI.onOpenRecent((filePath) => {
      openFilePathRef.current(filePath);
    });

    const unsubscribeRadial = window.electronAPI.onToggleRadial((enabled) => {
      dispatchRef.current(graphActions.setRadialLayout(enabled));
    });

    const unsubscribeReload = window.electronAPI.onReloadDocument(() => {
      reloadDocumentRef.current();
    });

    return () => {
      unsubscribeOpen();
      unsubscribeRecent();
      unsubscribeRadial();
      unsubscribeReload();
    };
  }, []); // Empty deps - only register once

  return {
    openFile,
    openFilePath,
    reloadDocument,
    clearGraph,
    isLoading: state.isLoading,
    error: state.error,
    filePath: state.filePath
  };
}
