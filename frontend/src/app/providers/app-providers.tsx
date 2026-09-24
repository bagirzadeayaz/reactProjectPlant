import { useEffect, useState, type ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import { initI18n } from '../../shared/i18n';
import { makeStore, type AppStore } from '../store';
import { connectStore } from '../store/store-lifecycle';

export interface AppProvidersProps {
  children: ReactNode;
  /** Inject a store in tests. Omitted in the app, which builds its own. */
  store?: AppStore;
}

/**
 * Everything the tree needs before it can render.
 *
 * The store is created per mount rather than at module scope — that is what
 * lets a test render the real app twice without the second run inheriting the
 * first one's cache. i18next is the opposite: one instance for the process, so
 * a language change is global and `<html lang>` has a single owner.
 */
export const AppProviders = ({ children, store }: AppProvidersProps) => {
  // The initializer runs only when no store was supplied, so passing one in a
  // test does not build a second store just to throw it away.
  const [ownStore] = useState<AppStore>(() => store ?? makeStore());
  const [i18nInstance] = useState(() => initI18n());
  const activeStore = store ?? ownStore;
  useEffect(() => connectStore(activeStore), [activeStore]);

  return (
    <I18nextProvider i18n={i18nInstance}>
      <Provider store={activeStore}>{children}</Provider>
    </I18nextProvider>
  );
};
