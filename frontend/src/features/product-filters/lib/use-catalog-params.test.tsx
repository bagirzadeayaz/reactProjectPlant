import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { useCatalogParams } from './use-catalog-params';

const wrapper = (entry: string) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={[entry]}>{children}</MemoryRouter>;
  };

const useBoth = () => ({ params: useCatalogParams(), search: useLocation().search });

describe('useCatalogParams', () => {
  it('reads the URL and writes changes back, resetting the page on a filter change', () => {
    const { result } = renderHook(useBoth, { wrapper: wrapper('/catalog?page=3&lang=ru') });
    expect(result.current.params.params.page).toBe(3);

    act(() => {
      result.current.params.update({ category: 'trendy' });
    });
    expect(result.current.search).toBe('?lang=ru&category=trendy');
    expect(result.current.params.params.page).toBe(1);

    act(() => {
      result.current.params.update({ page: 2 });
    });
    expect(result.current.search).toBe('?lang=ru&category=trendy&page=2');
  });

  it('reset keeps only the language', () => {
    const { result } = renderHook(useBoth, { wrapper: wrapper('/catalog?search=x&lang=ru') });
    act(() => {
      result.current.params.reset();
    });
    expect(result.current.search).toBe('?lang=ru');
  });
});
