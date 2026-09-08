import { useId, useRef, useState, type DragEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { UseFormReturn } from 'react-hook-form';
import { cn } from '../../../shared/lib/cn';
import { Button, Input } from '../../../shared/ui';
import type { ProductFormValues } from '../lib/form-values';
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
 * link stays a link, an uploaded file becomes a data URL the mock backend
 * stores as-is. The preview reads that one field, so whichever way the image
 * arrived, what the admin sees is what the catalog will show.
 */
export const ImageField = ({ form }: ImageFieldProps) => {
  const { t } = useTranslation('admin');
  const { register, watch, setValue, formState } = form;
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<ImageFileError | null>(null);
  const [isOver, setIsOver] = useState(false);
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
    <fieldset className="flex flex-col gap-3">
      <legend className="text-lg text-ink">{t('image.legend')}</legend>
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div className="flex flex-col gap-3">
          <Input
            label={t('fields.imageUrl')}
            description={t('image.hint', { max: MAX_IMAGE_KB })}
            {...(urlError === undefined ? {} : { error: urlError })}
            {...register('imageUrl')}
          />
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setIsOver(true);
            }}
            onDragLeave={() => {
              setIsOver(false);
            }}
            onDrop={handleDrop}
            className={cn(
              'rounded-control border border-dashed border-border-control p-6 text-center text-md text-ink-muted transition-colors',
              isOver && 'border-ink text-ink',
            )}
          >
            {t('image.dropzone')}{' '}
            <button
              type="button"
              className="underline underline-offset-4 hover:text-ink"
              onClick={() => inputRef.current?.click()}
            >
              {t('image.browse')}
            </button>
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
          {fileError !== null && (
            <p role="alert" className="text-sm text-ink">
              {t(`image.${fileError}`, { max: MAX_IMAGE_KB })}
            </p>
          )}
        </div>
        <figure className="flex flex-col items-center gap-2">
          <div className="flex size-(--size-thumb) items-center justify-center overflow-hidden rounded-control border border-border-control bg-surface-glass">
            {imageUrl === '' ? (
              <span className="px-2 text-center text-sm text-ink-muted">
                {t('image.noPreview')}
              </span>
            ) : (
              <img
                id={previewId}
                src={imageUrl}
                alt={t('image.preview')}
                className="size-full object-contain"
              />
            )}
          </div>
          {imageUrl !== '' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setValue('imageUrl', '', { shouldDirty: true, shouldValidate: true });
              }}
            >
              {t('image.remove')}
            </Button>
          )}
        </figure>
      </div>
    </fieldset>
  );
};
