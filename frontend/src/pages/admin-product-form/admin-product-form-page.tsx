import { DocumentMeta } from '../../shared/lib/document-meta';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  useCreateProductMutation,
  useGetAdminProductQuery,
  useUpdateProductMutation,
} from '../../entities/product';
import { toFormValues, type ProductFormValues } from '../../features/product-form';
import { Container, EmptyState, Skeleton } from '../../shared/ui';
import { ProductEditor } from './product-editor';

const LIST_PATH = '/admin/products';

/**
 * `/admin/products/new` and `/admin/products/:id`. Loads the product for an
 * edit, then hands both cases to `ProductEditor`, which owns the form.
 * Keying the editor on the product id means a fresh form per product — no
 * `reset()` choreography when the route changes underneath it.
 */
export const AdminProductFormPage = () => {
  const { t } = useTranslation(['admin', 'common']);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const duplicateId = id === undefined ? params.get('duplicate') : null;
  const isEdit = id !== undefined;
  const sourceId = id ?? duplicateId;
  const product = useGetAdminProductQuery(sourceId ?? '', { skip: !sourceId });
  const initialValues = product.data ? toFormValues(product.data) : undefined;
  if (initialValues && duplicateId) {
    initialValues.slug = '';
    initialValues.status = 'draft';
    initialValues.name = {
      en: `${initialValues.name.en} (copy)`.slice(0, 500),
      ru: `${initialValues.name.ru} (копия)`.slice(0, 500),
    };
  }
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();

  const title = duplicateId
    ? t('admin:inventory.duplicate')
    : isEdit
      ? t('admin:edit')
      : t('admin:new');
  const goToList = (): void => void navigate(LIST_PATH);

  const save = async (values: ProductFormValues): Promise<void> => {
    if (isEdit) await updateProduct({ id, patch: values }).unwrap();
    else await createProduct(values).unwrap();
  };

  return (
    <Container as="section" className="product-editor-page">
      <DocumentMeta title={`${title} · ${t('common:meta.siteName')}`} robots="noindex" />
      <header className="product-editor-heading">
        <Link to={LIST_PATH} className="product-editor-back">
          <ArrowLeft size={18} aria-hidden="true" />
          {t('admin:form.backToList')}
        </Link>
        <h1>{title}</h1>
        <p>{t(isEdit ? 'admin:form.editHint' : 'admin:form.createHint')}</p>
      </header>

      {sourceId && product.isLoading && (
        <div aria-busy="true" aria-label={t('admin:form.loading')}>
          <Skeleton className="h-96 w-full rounded-control" />
        </div>
      )}
      {sourceId && product.isError && <EmptyState title={t('admin:form.notFound')} />}
      {(!sourceId || product.isSuccess) && (
        <ProductEditor
          key={product.data?.id ?? 'new'}
          mode={isEdit ? 'edit' : 'create'}
          {...(initialValues === undefined ? {} : { initialValues })}
          onSave={save}
          onDone={goToList}
        />
      )}
    </Container>
  );
};
