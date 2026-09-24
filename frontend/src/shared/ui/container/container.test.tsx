import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Container } from './container';

describe('Container', () => {
  it('renders a div by default', () => {
    render(<Container data-testid="c">content</Container>);
    expect(screen.getByTestId('c').tagName).toBe('DIV');
  });

  it('renders the element given by `as`', () => {
    render(
      <Container as="main" data-testid="c">
        content
      </Container>,
    );
    expect(screen.getByTestId('c').tagName).toBe('MAIN');
  });

  it('carries the content max-width from the comp', () => {
    render(<Container data-testid="c">content</Container>);
    expect(screen.getByTestId('c')).toHaveClass('max-w-(--size-content)');
  });

  it('merges a caller className', () => {
    render(
      <Container className="pb-10" data-testid="c">
        content
      </Container>,
    );
    expect(screen.getByTestId('c')).toHaveClass('pb-10');
  });
});
