import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Card } from './card';

describe('Card', () => {
  it('applies the frosted panel treatment by default', () => {
    render(<Card data-testid="card">body</Card>);
    expect(screen.getByTestId('card')).toHaveClass('backdrop-blur-panel');
  });

  it('drops the treatment for the plain tone', () => {
    render(
      <Card tone="plain" data-testid="card">
        body
      </Card>,
    );
    expect(screen.getByTestId('card')).not.toHaveClass('backdrop-blur-panel');
  });

  it('renders the element given by `as`', () => {
    render(
      <Card as="article" data-testid="card">
        body
      </Card>,
    );
    expect(screen.getByTestId('card').tagName).toBe('ARTICLE');
  });

  it('merges a caller className', () => {
    render(
      <Card className="p-6" data-testid="card">
        body
      </Card>,
    );
    expect(screen.getByTestId('card')).toHaveClass('p-6');
  });
});
