import { DocumentMeta } from '../../shared/lib/document-meta';
import { useTranslation } from 'react-i18next';
import { Button, StatusPage } from '../../shared/ui';

/**
 * The catch-all route: the comp's leaves and display type around a "404",
 * an `<h1>` for the router to announce, and one clear way out.
 */
export const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <DocumentMeta title={`${t('notFound.title')} · ${t('meta.siteName')}`} robots="noindex" />
      <StatusPage
        code="404"
        title={t('notFound.title')}
        description={t('notFound.body')}
        action={
          <Button as="a" href="/">
            {t('notFound.home')}
          </Button>
        }
      />
    </>
  );
};
