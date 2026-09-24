import { Button, Icon, Section } from '../../../shared/ui';

const COPY = {
  title: 'Buttons',
  primary: 'Explore',
  withIcon: 'Buy Now',
  ghost: 'Live Demo...',
  small: 'Small',
  loading: 'Loading',
  loadingLabel: 'Loading',
  disabled: 'Disabled',
  link: 'As a link',
} as const;

/** Dev-only showcase. Strings stay in COPY so the i18n pass in prompt 6 is mechanical. */
export const ButtonsSection = () => (
  <Section title={COPY.title} titleId="ui-kit-buttons">
    <div className="flex flex-wrap items-center gap-gutter">
      <Button>{COPY.primary}</Button>
      <Button variant="primary-with-icon" icon={<Icon name="bag" />}>
        {COPY.withIcon}
      </Button>
      <Button variant="ghost">{COPY.ghost}</Button>
      <Button size="sm">{COPY.small}</Button>
      <Button isLoading loadingLabel={COPY.loadingLabel}>
        {COPY.loading}
      </Button>
      <Button disabled>{COPY.disabled}</Button>
      <Button as="a" href="#ui-kit-buttons">
        {COPY.link}
      </Button>
    </div>
  </Section>
);
