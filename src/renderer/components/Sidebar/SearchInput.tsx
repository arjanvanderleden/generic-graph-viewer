import { useState, useCallback, useEffect, useRef } from 'react';
import { useGraph } from '../../context/GraphContext';
import { useSelection, selectionActions } from '../../context/SelectionContext';
import { SearchIcon } from '../Icons';
import { SEARCH_DEBOUNCE_MS } from '../../config/constants';
import type { Node } from '../../types/graph';
import './SearchInput.css';

/**
 * Searches nodes by id, name, or categories
 */
function searchNodes(query: string, nodes: Node[]): Node[] {
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase();

  return nodes.filter((node) => {
    if (node.id.toLowerCase().includes(lowerQuery)) return true;
    if (node.name.toLowerCase().includes(lowerQuery)) return true;
    if (node.categories) {
      return node.categories.some((cat) => cat.toLowerCase().includes(lowerQuery));
    }
    return false;
  });
}

export function SearchInput() {
  const { state: graphState } = useGraph();
  const { dispatch: selectionDispatch } = useSelection();

  const [query, setQuery] = useState('');
  const [matchCount, setMatchCount] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback(
    (searchQuery: string) => {
      if (!graphState.graphData) {
        setMatchCount(null);
        return;
      }

      if (!searchQuery.trim()) {
        setMatchCount(null);
        return;
      }

      const matches = searchNodes(searchQuery, graphState.graphData.nodes);
      setMatchCount(matches.length);

      if (matches.length > 0) {
        selectionDispatch(selectionActions.selectNodes(matches.map((n) => n.id)));
      }
    },
    [graphState.graphData, selectionDispatch]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);

      // Debounce search
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        handleSearch(value);
      }, SEARCH_DEBOUNCE_MS);
    },
    [handleSearch]
  );

  const handleClear = useCallback(() => {
    setQuery('');
    setMatchCount(null);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Clear search when graph changes
  useEffect(() => {
    handleClear();
  }, [graphState.graphData, handleClear]);

  if (!graphState.graphData) {
    return null;
  }

  return (
    <div className="search-input">
      <div className="search-input__field">
        <SearchIcon size={16} className="search-input__icon" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search nodes..."
          className="search-input__input"
        />
        {query && (
          <button
            className="search-input__clear"
            onClick={handleClear}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>
      {matchCount !== null && (
        <div className="search-input__results">
          {matchCount === 0
            ? 'No matches'
            : `${matchCount} node${matchCount !== 1 ? 's' : ''} found`}
        </div>
      )}
    </div>
  );
}
