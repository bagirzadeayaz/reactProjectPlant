import { useId, useState, type SubmitEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../shared/lib/cn';
import { Button, Input, useToast } from '../../../shared/ui';
import { parseEmail, subscribe } from '../model/subscribe';

export interface NewsletterFormProps {
  className?: string;
}

/**
 * The footer sign-up — node 22:226 is a rectangle with a text layer, so the
 * comp gives only the look. This is a real form: a labelled email input,
 * validation before submit, a busy state, and a toast either way.
 */
export const NewsletterForm = ({ className }: NewsletterFormProps) => {
  const { t } = useTranslation(['common', 'home']);
  const { show } = useToast();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formId = useId();

  const onSubmit = async (event: SubmitEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const parsed = parseEmail(email);
    if (!parsed.success) {
      setError(t('home:newsletter.invalid'));
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await subscribe(parsed.data);
      show({ message: t('home:newsletter.success'), tone: 'success' });
      setEmail('');
    } catch {
      show({ message: t('home:newsletter.error'), tone: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      id={formId}
      noValidate
      onSubmit={(event) => {
        void onSubmit(event);
      }}
      className={cn('newsletter-form flex flex-col sm:flex-row', className)}
    >
      <Input
        type="email"
        name="email"
        autoComplete="email"
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          if (error !== null) setError(null);
        }}
        label={t('common:footer.emailLabel')}
        placeholder={t('common:footer.emailPlaceholder')}
        {...(error === null ? {} : { error })}
        containerClassName="flex-1"
      />
      <Button
        type="submit"
        size="sm"
        isLoading={isSubmitting}
        loadingLabel={t('common:a11y.loading')}
        className="sm:mt-9"
      >
        {t('common:footer.subscribe')}
      </Button>
    </form>
  );
};
