import { useState } from 'react';

/**
 * Which rows are ticked. Ids that leave the list (deleted, filtered out) are
 * pruned when the caller passes the current visible ids, so "delete selected"
 * never acts on something the user cannot see.
 */
export const useSelection = (visibleIds: readonly string[]) => {
  const [selected, setSelected] = useState<ReadonlySet<string>>(() => new Set());
  const visible = new Set(visibleIds);
  const pruned = [...selected].filter((id) => visible.has(id));
  const current: ReadonlySet<string> = pruned.length === selected.size ? selected : new Set(pruned);

  const toggle = (id: string): void => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = (): void => {
    setSelected(visibleIds.every((id) => current.has(id)) ? new Set() : new Set(visibleIds));
  };

  const clear = (): void => {
    setSelected(new Set());
  };

  return { selected: current, toggle, toggleAll, clear };
};
