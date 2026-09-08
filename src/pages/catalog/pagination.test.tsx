import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { describe, expect, it, vi } from 'vitest';
import { initI18n } from '../../shared/i18n';
import { Pagination } from './pagination';

const i18n = initI18n();

const renderPagination = (page: number, total = 14, onChange = vi.fn<(n: number) => void>()) => {
  render(
    <I18nextProvider i18n={i18n}>
      <Pagination page={page} total={total} perPage={6} onChange={onChange} />
    </I18nextProvider>,
  );
  return onChange;
};

describe('Pagination', () => {
  it('renders nothing for a single page', () => {
    renderPagination(1, 6);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('marks the current page and disables the edges', () => {
    renderPagination(1);
    expect(screen.getByRole('button', { name: 'Current page, page 1' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  it('reports the page the user asked for', async () => {
    const onChange = renderPagination(2);
    await userEvent.click(screen.getByRole('button', { name: 'Page 3' }));
    await userEvent.click(screen.getByRole('button', { name: 'Previous' }));
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(onChange.mock.calls.map(([n]) => n)).toEqual([3, 1, 3]);
  });
});
