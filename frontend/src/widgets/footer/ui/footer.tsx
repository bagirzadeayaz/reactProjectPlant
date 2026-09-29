import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { cn } from '../../../shared/lib/cn';
import { NewsletterForm } from '../../../features/newsletter';
import { Container, Icon } from '../../../shared/ui';
import { SHOP_LINKS, EXPERIENCE_LINKS, HELP_LINKS } from '../../../shared/config/navigation';

const SOCIALS = [
  { label: 'Facebook', icon: 'facebook', href: 'https://facebook.com' },
  { label: 'Twitter', icon: 'twitter', href: 'https://twitter.com' },
  { label: 'LinkedIn', icon: 'linkedin', href: 'https://linkedin.com' },
] as const;

const linkClass = cn(
  'rounded-icon text-lg text-ink-muted transition-colors hover:text-ink',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink',
  'focus-visible:ring-offset-2 focus-visible:ring-offset-surface-footer',
);

/**
 * The site footer, from node 22:209 — the one flat surface in the comp
 * (`#222c1d`) under the photographic background.
 *
 * The newsletter field is a real form: a label the eye does not need but a
 * screen reader does, and a submit button rather than an icon that only looks
 * like one.
 */
export const Footer = () => {
  const { t, i18n } = useTranslation();

  return (
    <footer className="site-footer bg-surface-footer">
      <Container as="div" className="footer-grid grid">
        <div>
          <Link
            to="/"
            className="brand footer-brand rounded-icon font-(--font-weight-wordmark) text-ink-muted hover:text-ink"
          >
            <img src="/images/planto-logo.png" alt="" width={88} height={88} />
            {t('brand')}
          </Link>
          <p className="mt-4 max-w-prose text-base leading-relaxed text-ink-muted">
            {t('footer.about')}
          </p>

          <ul className="footer-socials flex gap-8">
            {SOCIALS.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  rel="noreferrer noopener"
                  target="_blank"
                  aria-label={social.label}
                  className={cn(linkClass, 'inline-flex size-11 items-center justify-center')}
                >
                  <Icon name={social.icon} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav className="footer-navigation" aria-label={t('a11y.footerNavigation')}>
          {(
            [
              { label: 'nav.catalog', links: SHOP_LINKS },
              { label: 'nav.discover', links: EXPERIENCE_LINKS },
              { label: 'nav.help', links: HELP_LINKS },
            ] as const
          ).map((group) => (
            <div key={group.label}>
              <h2>{t(group.label)}</h2>
              <ul>
                {group.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to}>{t(link.labelKey)}</Link>
                  </li>
                ))}
                {group.label === 'nav.discover' && (
                  <li>
                    <a href={`/promo.html?lang=${i18n.resolvedLanguage === 'ru' ? 'ru' : 'en'}`}>
                      {t('nav.film')}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          ))}
        </nav>

        <div>
          <h2 className="text-lg text-ink">{t('footer.updates')}</h2>
          <NewsletterForm className="mt-6" />
        </div>
      </Container>

      <Container as="div" className="footer-rights">
        <p className="text-sm text-ink-muted">{t('footer.rights')}</p>
      </Container>
    </footer>
  );
};
