import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '../../../shared/ui';
import type { ProductFormValues } from '../lib/form-values';
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_KB, readImageFile } from '../lib/read-image-file';

export const GalleryField = ({ form }: { form: UseFormReturn<ProductFormValues> }) => {
  const { t } = useTranslation('admin');
  const gallery = form.watch('gallery') ?? [];
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [reading, setReading] = useState(false);
  const update = (values: string[]): void => {
    form.setValue('gallery', values, { shouldDirty: true, shouldValidate: true });
  };
  const files = async (items: File[]): Promise<void> => {
    setReading(true);
    setError('');
    const next = [...gallery];
    for (const file of items) {
      if (next.length >= 5) {
        setError(t('inventory.galleryLimit'));
        break;
      }
      const result = await readImageFile(file);
      if (result.ok) next.push(result.dataUrl);
      else setError(t(`image.${result.error}`, { max: MAX_IMAGE_KB }));
    }
    update(next);
    setReading(false);
  };
  const move = (index: number, offset: number): void => {
    const next = [...gallery];
    const item = next[index];
    if (!item) return;
    next.splice(index, 1);
    next.splice(index + offset, 0, item);
    update(next);
  };
  return (
    <fieldset className="admin-gallery-editor" disabled={reading}>
      <legend>{t('inventory.gallery')}</legend>
      <p>{t('inventory.galleryHint')}</p>
      <ul>
        {gallery.map((image, index) => (
          <li key={`${String(index)}-${image.slice(-32)}`}>
            <img src={image} alt={t('inventory.galleryImage', { number: index + 1 })} />
            <div>
              <button
                type="button"
                onClick={() => {
                  const cover = form.getValues('imageUrl');
                  form.setValue('imageUrl', image, { shouldDirty: true, shouldValidate: true });
                  update(
                    cover
                      ? gallery.map((item, i) => (i === index ? cover : item))
                      : gallery.filter((_, i) => i !== index),
                  );
                }}
              >
                {t('inventory.makeCover')}
              </button>
              <button
                type="button"
                disabled={index === 0}
                aria-label={t('inventory.moveEarlier', { number: index + 1 })}
                onClick={() => {
                  move(index, -1);
                }}
              >
                ←
              </button>
              <button
                type="button"
                disabled={index === gallery.length - 1}
                aria-label={t('inventory.moveLater', { number: index + 1 })}
                onClick={() => {
                  move(index, 1);
                }}
              >
                →
              </button>
              <button
                type="button"
                onClick={() => {
                  update(gallery.filter((_, i) => i !== index));
                }}
              >
                {t('image.remove')}
              </button>
            </div>
          </li>
        ))}
      </ul>
      <Input
        label={t('inventory.galleryUpload')}
        type="file"
        multiple
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        disabled={gallery.length >= 5}
        onChange={(event) => {
          void files(Array.from(event.target.files ?? []));
          event.target.value = '';
        }}
      />
      <Input
        label={t('inventory.galleryUrl')}
        type="url"
        value={url}
        disabled={gallery.length >= 5}
        onChange={(event) => {
          setUrl(event.target.value);
        }}
      />
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={gallery.length >= 5 || !url}
        onClick={() => {
          try {
            const parsed = new URL(url);
            if (parsed.protocol !== 'https:' || url.length > 2048) throw new Error();
            update([...gallery, parsed.href]);
            setUrl('');
            setError('');
          } catch {
            setError(t('image.urlHint'));
          }
        }}
      >
        {t('inventory.addImage')}
      </Button>
      {error && <p role="alert">{error}</p>}
    </fieldset>
  );
};
