import { useId, useRef, useState, type DragEvent } from 'react';
import { ImagePlus, Upload, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { UseFormReturn } from 'react-hook-form';
import { cn } from '../../../shared/lib/cn';
import { Button, Input } from '../../../shared/ui';
import type { ProductFormValues } from '../lib/form-values';
import { GalleryField } from './gallery-field';
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_KB,
  readImageFile,
  type ImageFileError,
} from '../lib/read-image-file';

export interface ImageFieldProps {
  form: UseFormReturn<ProductFormValues>;
}

/**
 * Image URL plus a drop zone. Both write the same `imageUrl` field: a pasted
 * link stays a link; an uploaded file becomes a data URL until the API stores
 * its bytes under a SHA-256 ID and returns a permanent image URL. The preview
 * reads that one field for either input.
 */
export const ImageField = ({ form }: ImageFieldProps) => {
  const { t } = useTranslation('admin');
  const { register, watch, setValue, formState } = form;
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<ImageFileError | null>(null);
  const [isOver, setIsOver] = useState(false);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const previewId = useId();
  const imageUrl = watch('imageUrl');
  const urlError = formState.errors.imageUrl?.message;

  const accept = async (file: File | undefined): Promise<void> => {
    if (!file) return;
    const result = await readImageFile(file);
    if (result.ok) {
      setFileError(null);
      setValue('imageUrl', result.dataUrl, { shouldDirty: true, shouldValidate: true });
    } else {
      setFileError(result.error);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    setIsOver(false);
    void accept(event.dataTransfer.files[0]);
  };

  return (
    <fieldset className="product-editor-image product-editor-panel">
      <legend className="sr-only">{t('image.legend')}</legend>
      <h2 aria-hidden="true">{t('image.legend')}</h2>
      <div className="product-image-content">
        <figure className="product-image-figure">
          <div className="product-image-preview">
            {imageUrl === '' || failedUrl === imageUrl ? (
              <div className="product-image-empty" role="status">
                <ImagePlus size={36} strokeWidth={1.25} aria-hidden="true" />
                <span>{t(imageUrl === '' ? 'image.noPreview' : 'image.loadFailed')}</span>
              </div>
            ) : (
              <img
                id={previewId}
                src={imageUrl}
                alt={t('image.preview')}
                onError={() => {
                  setFailedUrl(imageUrl);
                }}
                className="size-full object-contain"
              />
            )}
          </div>
          {imageUrl !== '' && (
            <Button
              variant="ghost"
              size="sm"
              className="product-image-remove"
              onClick={() => {
                setValue('imageUrl', '', { shouldDirty: true, shouldValidate: true });
              }}
            >
              <Trash2 size={16} aria-hidden="true" />
              {t('image.remove')}
            </Button>
          )}
        </figure>
        <div className="product-image-inputs">
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setIsOver(true);
            }}
            onDragLeave={() => {
              setIsOver(false);
            }}
            onDrop={handleDrop}
            className={cn('product-image-dropzone', isOver && 'is-over')}
          >
            <Upload size={22} aria-hidden="true" />
            <span>
              {t('image.dropzone')}{' '}
              <button type="button" onClick={() => inputRef.current?.click()}>
                {t('image.browse')}
              </button>
            </span>
            <small>{t('image.hint', { max: MAX_IMAGE_KB })}</small>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(',')}
              aria-label={t('image.input')}
              className="sr-only"
              onChange={(event) => {
                void accept(event.target.files?.[0]);
                event.target.value = '';
              }}
            />
          </div>
          <Input
            label={t('fields.imageUrl')}
            description={t('image.urlHint')}
            {...(urlError === undefined ? {} : { error: urlError })}
            {...register('imageUrl')}
          />
          {fileError !== null && (
            <p role="alert" className="text-sm text-ink">
              {t(`image.${fileError}`, { max: MAX_IMAGE_KB })}
            </p>
          )}
        </div>
      </div>
      <GalleryField form={form} />
    </fieldset>
  );
};
