import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { cn } from '../../../shared/lib/cn';
import { NAV_LINKS } from '../../../shared/config/navigation';

export interface NavLinkListProps {
  /** Vertical inside the mobile panel, horizontal in the bar. */
  orientation?: 'horizontal' | 'vertical';
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
  onNavigate,
  className,
}: NavLinkListProps) => {
  const { t } = useTranslation();

  return (
    <ul
      className={cn(
        'flex gap-8',
        orientation === 'vertical' ? 'flex-col gap-6' : 'items-center',
        className,
      )}
    >
      {NAV_LINKS.map((link) => (
        <li key={link.to}>
          <NavLink
            to={link.to}
            end={link.to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'rounded-icon text-lg transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink',
                'focus-visible:ring-offset-2 focus-visible:ring-offset-surface-footer',
                isActive ? 'text-ink' : 'text-ink-muted hover:text-ink',
              )
            }
          >
            {t(link.labelKey)}
          </NavLink>
        </li>
      ))}
    </ul>
  );
};
