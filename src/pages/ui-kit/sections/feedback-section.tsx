import {
  Button,
  EmptyState,
  ErrorState,
  Icon,
  Section,
  Skeleton,
  Spinner,
} from '../../../shared/ui';

const COPY = {
  title: 'Feedback',
  spinnerLabel: 'Loading',
  emptyTitle: 'No plants yet',
  emptyDescription: 'Try a different filter or clear your search.',
  emptyAction: 'Clear filters',
  errorTitle: 'Could not load plants',
  errorDescription: 'Check your connection and try again.',
  errorAction: 'Retry',
} as const;

/** Dev-only showcase. Strings stay in COPY so the i18n pass in prompt 6 is mechanical. */
export const FeedbackSection = () => (
  <Section title={COPY.title} titleId="ui-kit-feedback">
    <div className="flex flex-col gap-10">
      <Spinner label={COPY.spinnerLabel} className="text-h2 text-ink" />

      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>

      <EmptyState
        title={COPY.emptyTitle}
        description={COPY.emptyDescription}
        media={<Icon name="bag" size="lg" />}
        action={<Button size="sm">{COPY.emptyAction}</Button>}
      />

      <ErrorState
        title={COPY.errorTitle}
        description={COPY.errorDescription}
        action={<Button size="sm">{COPY.errorAction}</Button>}
      />
    </div>
  </Section>
);
