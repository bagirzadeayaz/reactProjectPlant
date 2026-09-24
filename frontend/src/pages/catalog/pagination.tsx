import { useTranslation } from 'react-i18next';
import { cn } from '../../shared/lib/cn';
import { Icon } from '../../shared/ui';

export interface PaginationProps {
  page: number;
  total: number;
  perPage: number;
  onChange: (page: number) => void;
}

const buttonClass = cn(
  'flex size-(--size-icon-button) items-center justify-center rounded-icon',
  'border-(length:--border-width-control) border-border-control text-ink-muted',
  'transition-colors hover:border-ink hover:text-ink',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink',
  'disabled:cursor-not-allowed disabled:opacity-40',
);

/**
 * Numbered pages rather than infinite scroll: the page number lives in the
 * URL like every other filter, so a shared link lands on the same page, and
 * the footer stays reachable.
 */
export const Pagination = ({ page, total, perPage, onChange }: PaginationProps) => {
  const { t } = useTranslation('catalog');
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  if (pageCount <= 1) return null;

  return (
    <nav aria-label={t('pagination')} className="mt-16 flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={() => {
          onChange(page - 1);
        }}
        disabled={page <= 1}
        aria-label={t('previous')}
        className={buttonClass}
      >
        <Icon name="chevron-left" />
      </button>

      <ol className="flex items-center gap-2">
        {Array.from({ length: pageCount }, (_, index) => index + 1).map((n) => (
          <li key={n}>
            <button
              type="button"
              onClick={() => {
                onChange(n);
              }}
              aria-label={n === page ? t('currentPage', { page: n }) : t('pageN', { page: n })}
              aria-current={n === page ? 'page' : undefined}
              className={cn(
                'flex size-(--size-icon-button) items-center justify-center rounded-icon text-lg',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink',
                n === page ? 'bg-surface-glass text-ink' : 'text-ink-muted hover:text-ink',
              )}
            >
              {n}
            </button>
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={() => {
          onChange(page + 1);
        }}
        disabled={page >= pageCount}
        aria-label={t('next')}
        className={buttonClass}
      >
        <Icon name="chevron-right" />
      </button>
    </nav>
  );
};
