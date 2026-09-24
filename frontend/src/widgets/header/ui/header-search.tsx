import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../../shared/lib/cn';
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
  return (
    <>
      <AnimatePresence initial={false}>
        {isSearchOpen && (
          <motion.form
            initial={reducedMotion ? false : { opacity: 0, scaleX: 0.05, filter: 'blur(3px)' }}
            animate={{ opacity: 1, scaleX: 1, filter: 'blur(0px)' }}
            exit={
              reducedMotion ? { opacity: 1 } : { opacity: 0, scaleX: 0.05, filter: 'blur(3px)' }
            }
            transition={{ duration: reducedMotion ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: 'right center' }}
            id="header-search"
            role="search"
            className={cn(
              'absolute inset-x-4 bottom-5 flex items-center gap-2 rounded-control border border-border-glass px-3 py-2',
              'sm:static sm:w-[min(28rem,42vw)]',
            )}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                onOpenChange(false);
                searchToggleRef.current?.focus();
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
              className="min-w-0 flex-1 rounded-icon bg-transparent px-2 py-1 text-ink placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
            />
            <button
              type="submit"
              className="rounded-icon p-1 text-ink-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
            >
              <Icon name="search" label={t('a11y.search')} />
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <button
        ref={searchToggleRef}
        type="button"
        aria-expanded={isSearchOpen}
        aria-controls="header-search"
        onClick={() => {
          onOpenChange(!isSearchOpen);
        }}
        className="rounded-icon p-1 text-ink-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
      >
        <Icon
          name={isSearchOpen ? 'close' : 'search'}
          label={isSearchOpen ? t('actions.close') : t('a11y.search')}
        />
      </button>
    </>
  );
};
