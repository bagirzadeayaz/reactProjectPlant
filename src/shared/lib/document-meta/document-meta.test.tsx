import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DocumentMeta } from './document-meta';

describe('DocumentMeta', () => {
  it('sets the title, description and robots, and updates them', () => {
    const { rerender } = render(<DocumentMeta title="One" description="First" robots="noindex" />);
    expect(document.title).toBe('One');
    expect(document.head.querySelector('meta[name="description"]')).toHaveAttribute(
      'content',
      'First',
    );
    expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex',
    );

    rerender(<DocumentMeta title="Two" description="Second" />);
    expect(document.title).toBe('Two');
    expect(document.head.querySelector('meta[name="description"]')).toHaveAttribute(
      'content',
      'Second',
    );
    expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
  });
});
