import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { useGetCategoriesQuery } from '../../../entities/category';
import { useLocale } from '../../../shared/i18n';
import { Icon } from '../../../shared/ui';
import { Link } from 'react-router-dom';
import { cn } from '../../../shared/lib/cn';
import { NAV_LINKS, PRIMARY_NAV_LINKS } from '../../../shared/config/navigation';

export interface NavLinkListProps {
  /** Vertical inside the mobile panel, horizontal in the bar. */
  orientation?: 'horizontal' | 'vertical';
  includeLogin?: boolean;
  onNavigate?: () => void;
  className?: string;
}

/**
 * The nav links themselves, shared by the desktop bar and the mobile panel.
 *
 * `aria-current="page"` comes from NavLink's `isActive`, so the active item is
 * announced as the current page rather than only looking different.
 */
export const NavLinkList = ({
  orientation = 'horizontal',
  includeLogin = false,
  onNavigate,
  className,
}: NavLinkListProps) => {
  const { t } = useTranslation();
  const { localized } = useLocale();
  const { data: categories = [] } = useGetCategoriesQuery(undefined);

  return (
    <ul
      className={cn(
        'flex gap-8',
        orientation === 'vertical' ? 'flex-col gap-6' : 'items-center',
        className,
      )}
    >
      {(includeLogin ? NAV_LINKS : PRIMARY_NAV_LINKS).map((link) => (
        <li key={link.to} className="nav-item">
          <NavLink
            to={link.to}
            end={link.to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'site-nav-link rounded-icon transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink',
                'focus-visible:ring-offset-2 focus-visible:ring-offset-surface-footer',
                isActive ? 'text-ink' : 'text-ink-muted hover:text-ink',
              )
            }
          >
            {t(link.labelKey)}
          </NavLink>
          {link.to === '/catalog' && categories.length > 0 && (
            <details className="plant-types">
              <summary aria-label={t('nav.plantTypes')}>
                <Icon name="chevron" />
              </summary>
              <div className="plant-types__options">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={'/catalog?category=' + category.slug}
                    onClick={(event) => {
                      event.currentTarget.closest('details')?.removeAttribute('open');
                      onNavigate?.();
                    }}
                  >
                    {localized(category.label)}
                  </Link>
                ))}
              </div>
            </details>
          )}
        </li>
      ))}
    </ul>
  );
};
