import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Section } from './section';

describe('Section', () => {
  it('renders its children', () => {
    render(<Section>body</Section>);
    expect(screen.getByText('body')).toBeInTheDocument();
  });

  it('renders no heading when no title is given', () => {
    render(<Section>body</Section>);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('renders the title as a level-2 heading', () => {
    render(
      <Section title="Our Top Selling" titleId="top-selling">
        body
      </Section>,
    );
    expect(screen.getByRole('heading', { level: 2, name: 'Our Top Selling' })).toBeInTheDocument();
  });

  it('names the region with its heading', () => {
    render(
      <Section title="Our Top Selling" titleId="top-selling">
        body
      </Section>,
    );
    expect(screen.getByRole('region', { name: 'Our Top Selling' })).toBeInTheDocument();
  });
});
