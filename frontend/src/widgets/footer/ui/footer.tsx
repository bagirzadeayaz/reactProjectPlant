import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { cn } from '../../../shared/lib/cn';
import { NewsletterForm } from '../../../features/newsletter';
import { Container } from '../../../shared/ui';
import { NAV_LINKS } from '../../../shared/config/navigation';

const SOCIALS = [
  { label: 'FB', href: 'https://facebook.com' },
  { label: 'TW', href: 'https://twitter.com' },
  { label: 'LI', href: 'https://linkedin.com' },
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
  const { t } = useTranslation();

  return (
    <footer className="mt-16 border-t border-border-glass/30 bg-surface-footer py-12 lg:py-16">
      <Container as="div" className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-16">
        <div>
          <Link
            to="/"
            className="rounded-icon text-logo font-(--font-weight-wordmark) text-ink-muted hover:text-ink"
          >
            {t('brand')}
          </Link>
          <p className="mt-4 max-w-prose text-base leading-relaxed text-ink-muted">
            {t('footer.about')}
          </p>

          <ul className="mt-6 flex gap-6">
            {SOCIALS.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  rel="noreferrer noopener"
                  target="_blank"
                  className={linkClass}
                >
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-labelledby="footer-links-heading">
          <h2 id="footer-links-heading" className="text-lg text-ink">
            {t('footer.quickLinks')}
          </h2>
          <ul className="mt-5 flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className={linkClass}>
                  {t(link.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-lg text-ink">{t('footer.updates')}</h2>
          <NewsletterForm className="mt-6" />
        </div>
      </Container>

      <Container as="div" className="mt-10 border-t border-border-glass/20 pt-6">
        <p className="text-sm text-ink-muted">{t('footer.rights')}</p>
      </Container>
    </footer>
  );
};
