import { useTranslation } from 'react-i18next';
import { NewsletterForm } from '../../features/newsletter';
import { DocumentMeta } from '../../shared/lib/document-meta';
import { Button, Container } from '../../shared/ui';

const QUESTIONS = [
  { question: 'contact.q1', answer: 'contact.a1' },
  { question: 'contact.q2', answer: 'contact.a2' },
  { question: 'contact.q3', answer: 'contact.a3' },
] as const;

export const ContactPage = () => {
  const { t } = useTranslation('home');
  return (
    <Container as="section" className="editorial-page">
      <DocumentMeta title={t('contact.title') + ' · Planto.'} description={t('contact.lead')} />
      <p className="editorial-eyebrow">{t('contact.eyebrow')}</p>
      <h1 className="editorial-title text-ink">{t('contact.title')}</h1>
      <p className="editorial-lead">{t('contact.lead')}</p>
      <Button as="a" href="/care">
        {t('contact.careLink')}
      </Button>
      <div className="contact-layout">
        <section className="contact-faq" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-h2 text-ink">
            {t('contact.faqTitle')}
          </h2>
          {QUESTIONS.map((item) => (
            <details key={item.question}>
              <summary>{t(item.question)}</summary>
              <p>{t(item.answer)}</p>
            </details>
          ))}
        </section>
        <section className="contact-newsletter glass-surface" aria-labelledby="contact-updates">
          <h2 id="contact-updates">{t('contact.updatesTitle')}</h2>
          <p className="text-md">{t('contact.updatesBody')}</p>
          <NewsletterForm className="mt-8" />
        </section>
      </div>
    </Container>
  );
};
