import { useMemo } from 'react';
import { useGraph, graphActions } from '../../context/GraphContext';
import { useSelection, selectionActions } from '../../context/SelectionContext';
import {
  extractCategories,
  createCategoryColorMap,
  getCategoryCounts,
  nodeHasCategory
} from '../../utils/categoryColors';
import { EyeIcon, EyeOffIcon } from '../Icons';
import './CategoryLegend.css';

export function CategoryLegend() {
  const { state: graphState, dispatch: graphDispatch } = useGraph();
  const { dispatch: selectionDispatch } = useSelection();

  const { categories, colorMap, counts, uncategorizedCount } = useMemo(() => {
    if (!graphState.graphData) {
      return {
        categories: [],
        colorMap: new Map<string, string>(),
        counts: new Map<string, number>(),
        uncategorizedCount: 0
      };
    }

    const cats = extractCategories(graphState.graphData.nodes);
    const cMap = createCategoryColorMap(cats);
    const cnts = getCategoryCounts(graphState.graphData.nodes);

    return {
      categories: cats,
      colorMap: cMap,
      counts: cnts,
      uncategorizedCount: cnts.get('(uncategorized)') ?? 0
    };
  }, [graphState.graphData]);

  const handleCategoryClick = (e: React.MouseEvent, category: string) => {
    if (!graphState.graphData) return;

    const nodeIds = graphState.graphData.nodes
      .filter((n) => nodeHasCategory(n, category))
      .map((n) => n.id);

    if (nodeIds.length === 0) return;

    if (e.metaKey || e.ctrlKey) {
      // Cmd/Ctrl+click: remove from selection
      selectionDispatch(selectionActions.removeNodes(nodeIds));
    } else if (e.shiftKey) {
      // Shift+click: add to selection
      selectionDispatch(selectionActions.addNodes(nodeIds));
    } else {
      // Click: replace selection
      selectionDispatch(selectionActions.selectNodes(nodeIds));
    }
  };

  const handleVisibilityToggle = (e: React.MouseEvent, category: string) => {
    e.stopPropagation();
    graphDispatch(graphActions.toggleCategoryVisibility(category));
  };

  const isHidden = (category: string) => graphState.hiddenCategories.has(category);

  // Get all category keys including uncategorized
  const allCategoryKeys = useMemo(() => {
    const keys = [...categories];
    if (uncategorizedCount > 0) {
      keys.push('(uncategorized)');
    }
    return keys;
  }, [categories, uncategorizedCount]);

  const allHidden = allCategoryKeys.length > 0 &&
    allCategoryKeys.every((cat) => graphState.hiddenCategories.has(cat));

  const handleToggleAll = () => {
    if (allHidden) {
      // Show all
      graphDispatch(graphActions.setHiddenCategories(new Set()));
    } else {
      // Hide all
      graphDispatch(graphActions.setHiddenCategories(new Set(allCategoryKeys)));
    }
  };

  if (categories.length === 0 && uncategorizedCount === 0) {
    return null;
  }

  return (
    <div className="category-legend">
      <div className="category-legend__header">
        <button
          className="category-legend__toggle-all"
          onClick={handleToggleAll}
          title={allHidden ? 'Show all categories' : 'Hide all categories'}
        >
          {allHidden ? 'Show All' : 'Hide All'}
        </button>
      </div>
      <ul className="category-legend__list">
        {categories.map((category) => (
          <li key={category} className="category-legend__item">
            <div className={`category-legend__row ${isHidden(category) ? 'category-legend__row--hidden' : ''}`}>
              <button
                className="category-legend__visibility"
                onClick={(e) => handleVisibilityToggle(e, category)}
                title={isHidden(category) ? 'Show category' : 'Hide category'}
                aria-label={isHidden(category) ? 'Show category' : 'Hide category'}
              >
                {isHidden(category) ? <EyeOffIcon /> : <EyeIcon />}
              </button>
              <button
                className="category-legend__button"
                onClick={(e) => handleCategoryClick(e, category)}
                title={`Click: select, Shift: add, Cmd/Ctrl: remove`}
              >
                <span
                  className="category-legend__color"
                  style={{ backgroundColor: colorMap.get(category) }}
                />
                <span className="category-legend__name">{category}</span>
                <span className="category-legend__count">
                  {counts.get(category) ?? 0}
                </span>
              </button>
            </div>
          </li>
        ))}

        {uncategorizedCount > 0 && (
          <li className="category-legend__item">
            <div className={`category-legend__row ${isHidden('(uncategorized)') ? 'category-legend__row--hidden' : ''}`}>
              <button
                className="category-legend__visibility"
                onClick={(e) => handleVisibilityToggle(e, '(uncategorized)')}
                title={isHidden('(uncategorized)') ? 'Show uncategorized' : 'Hide uncategorized'}
                aria-label={isHidden('(uncategorized)') ? 'Show uncategorized' : 'Hide uncategorized'}
              >
                {isHidden('(uncategorized)') ? <EyeOffIcon /> : <EyeIcon />}
              </button>
              <button
                className="category-legend__button"
                onClick={(e) => handleCategoryClick(e, '(uncategorized)')}
                title="Click: select, Shift: add, Cmd/Ctrl: remove"
              >
                <span
                  className="category-legend__color"
                  style={{ backgroundColor: 'var(--node-color)' }}
                />
                <span className="category-legend__name category-legend__name--muted">
                  (uncategorized)
                </span>
                <span className="category-legend__count">{uncategorizedCount}</span>
              </button>
            </div>
          </li>
        )}
      </ul>
    </div>
  );
}
