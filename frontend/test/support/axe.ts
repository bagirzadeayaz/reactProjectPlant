import axe from 'axe-core';

/**
 * Runs axe and returns the violations as readable strings, so a failing
 * `toEqual([])` prints what is wrong and where instead of a matcher blob.
 *
 * Color contrast is off here on purpose: jsdom has no layout, so axe cannot
 * tell what sits over what. Contrast is checked in Chromium (see the
 * Lighthouse notes in ARCHITECTURE.md).
 */
export const audit = async (root: Element): Promise<string[]> => {
  const results = await axe.run(root, {
    rules: { 'color-contrast': { enabled: false } },
  });
  return results.violations.map(
    (violation) =>
      `${violation.id} (${violation.impact ?? 'n/a'}): ${violation.help}\n` +
      violation.nodes
        .map((node) => `  ${node.target.join(' ')}\n    ${node.failureSummary ?? ''}`)
        .join('\n'),
  );
};
