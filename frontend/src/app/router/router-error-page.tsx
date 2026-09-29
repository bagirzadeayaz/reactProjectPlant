import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DocumentMeta } from '../../shared/lib/document-meta';
import { StatusPage } from '../../shared/ui';

/** Router errors must never fall back to the framework's stack-trace screen. */
export const RouterErrorPage = () => {
  const error = useRouteError();
  const { t } = useTranslation();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  const title = t(notFound ? 'notFound.title' : 'state.error');
  return (
    <>
      <DocumentMeta title={`${title} · ${t('meta.siteName')}`} robots="noindex" />
      <StatusPage
        code={notFound ? '404' : '500'}
        title={title}
        description={t(notFound ? 'notFound.body' : 'state.errorDetail')}
        role="alert"
      />
    </>
  );
};
