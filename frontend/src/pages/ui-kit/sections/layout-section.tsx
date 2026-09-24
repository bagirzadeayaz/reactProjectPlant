import { Card, Icon, Section } from '../../../shared/ui';
import { ICONS, type IconName } from '../../../shared/ui/icon';

const COPY = {
  title: 'Layout and icons',
  glass: 'Card — glass tone (node 22:65)',
  plain: 'Card — plain tone',
} as const;

/** Dev-only showcase. Strings stay in COPY so the i18n pass in prompt 6 is mechanical. */
export const LayoutSection = () => (
  <Section title={COPY.title} titleId="ui-kit-layout">
    <div className="grid gap-6 sm:grid-cols-2">
      <Card className="p-8 text-ink-muted">{COPY.glass}</Card>
      <Card tone="plain" className="p-8 text-ink-muted">
        {COPY.plain}
      </Card>
    </div>

    <ul className="mt-10 flex flex-wrap gap-8 text-ink-muted">
      {(Object.keys(ICONS) as IconName[]).map((name) => (
        <li key={name} className="flex flex-col items-center gap-2">
          <Icon name={name} size="lg" />
          <span className="text-sm">{name}</span>
        </li>
      ))}
    </ul>
  </Section>
);
