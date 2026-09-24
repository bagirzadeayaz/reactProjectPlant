import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { initI18n } from '../../../shared/i18n';
import { LanguageSwitcher } from './language-switcher';

const i18n = initI18n();

const renderSwitcher = () =>
  render(
    <I18nextProvider i18n={i18n}>
      <LanguageSwitcher />
    </I18nextProvider>,
  );

describe('LanguageSwitcher', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  afterEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('is a labelled group of toggle buttons', () => {
    renderSwitcher();
    expect(screen.getByRole('group', { name: 'Language' })).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });

  it('marks the active language pressed', () => {
    renderSwitcher();
    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Russian' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('switches the language on click', async () => {
    renderSwitcher();
    await userEvent.click(screen.getByRole('button', { name: 'Russian' }));

    expect(i18n.language).toBe('ru');
    expect(screen.getByRole('button', { name: 'Русский' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('relabels itself in the new language', async () => {
    renderSwitcher();
    await userEvent.click(screen.getByRole('button', { name: 'Russian' }));

    expect(screen.getByRole('group', { name: 'Язык' })).toBeInTheDocument();
  });

  it('is operable by keyboard alone', async () => {
    renderSwitcher();
    await userEvent.tab();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Russian' })).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    expect(i18n.language).toBe('ru');
  });

  it('updates <html lang> so assistive tech picks the right voice', async () => {
    renderSwitcher();
    await userEvent.click(screen.getByRole('button', { name: 'Russian' }));
    expect(document.documentElement.lang).toBe('ru');

    await userEvent.click(screen.getByRole('button', { name: 'Английский' }));
    expect(document.documentElement.lang).toBe('en');
  });

  it('tags each option with its own lang, so the label is pronounced correctly', () => {
    renderSwitcher();
    expect(screen.getByRole('button', { name: 'Russian' })).toHaveAttribute('lang', 'ru');
  });
});
