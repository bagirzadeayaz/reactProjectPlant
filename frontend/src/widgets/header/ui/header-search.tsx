import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '../../../shared/ui';

interface HeaderSearchProps {
  isSearchOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const HeaderSearch = ({ isSearchOpen, onOpenChange }: HeaderSearchProps) => {
  const { t } = useTranslation(['common', 'catalog']);
  const { search } = useLocation();
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchToggleRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (isSearchOpen) searchInputRef.current?.focus();
  }, [isSearchOpen]);
  const closeSearch = (): void => {
    onOpenChange(false);
    requestAnimationFrame(() => searchToggleRef.current?.focus());
  };
  return (
    <>
      <AnimatePresence initial={false}>
        {isSearchOpen && (
          <motion.form
            initial={reducedMotion ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            id="header-search"
            role="search"
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault();
                closeSearch();
              }
            }}
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              const value = data.get('search');
              const query = typeof value === 'string' ? value.trim() : '';
              const params = new URLSearchParams();
              const lang = new URLSearchParams(search).get('lang');
              if (lang) params.set('lang', lang);
              if (query) params.set('search', query);
              onOpenChange(false);
              void navigate({ pathname: '/catalog', search: params.toString() });
            }}
          >
            <input
              ref={searchInputRef}
              type="search"
              name="search"
              aria-label={t('catalog:searchLabel')}
              placeholder={t('catalog:searchPlaceholder')}
              defaultValue={new URLSearchParams(search).get('search') ?? ''}
              autoComplete="off"
              enterKeyHint="search"
            />
            <button type="submit" className="header-search-submit">
              <Icon name="search" label={t('a11y.search')} />
            </button>
            <button type="button" className="header-search-close" onClick={closeSearch}>
              <Icon name="close" label={t('actions.close')} />
            </button>
          </motion.form>
        )}
      </AnimatePresence>
      <button
        ref={searchToggleRef}
        type="button"
        hidden={isSearchOpen}
        aria-expanded={isSearchOpen}
        aria-controls={isSearchOpen ? 'header-search' : undefined}
        onClick={() => {
          onOpenChange(true);
        }}
        className="header-search-toggle rounded-icon p-1 text-ink-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
      >
        <Icon name="search" label={t('a11y.search')} />
        <span className="header-action-label" aria-hidden="true">{t('a11y.search')}</span>
      </button>
    </>
  );
};
