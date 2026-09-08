import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Select } from './select';

const OPTIONS = [
  { value: 'trendy', label: 'Trendy' },
  { value: 'top', label: 'Top selling' },
  { value: 'rare', label: 'Rare', disabled: true },
] as const;

describe('Select', () => {
  it('associates the label with the control', () => {
    render(<Select label="Category" options={OPTIONS} />);
    expect(screen.getByLabelText('Category')).toBeInstanceOf(HTMLSelectElement);
  });

  it('renders every option', () => {
    render(<Select label="Category" options={OPTIONS} />);
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('renders the placeholder as a disabled first option', () => {
    render(<Select label="Category" options={OPTIONS} placeholder="Choose one" defaultValue="" />);
    expect(screen.getByRole('option', { name: 'Choose one' })).toBeDisabled();
  });

  it('selects by keyboard', async () => {
    const onChange = vi.fn();
    render(<Select label="Category" options={OPTIONS} onChange={onChange} defaultValue="trendy" />);
    await userEvent.selectOptions(screen.getByLabelText('Category'), 'top');
    expect(screen.getByLabelText('Category')).toHaveValue('top');
    expect(onChange).toHaveBeenCalled();
  });

  it('keeps a disabled option unselectable', () => {
    render(<Select label="Category" options={OPTIONS} />);
    expect(screen.getByRole('option', { name: 'Rare' })).toBeDisabled();
  });

  it('marks itself invalid and links the error', () => {
    render(<Select label="Category" options={OPTIONS} error="Pick one" />);
    const field = screen.getByLabelText('Category');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    const describedBy = field.getAttribute('aria-describedby') ?? '';
    expect(document.getElementById(describedBy)).toHaveTextContent('Pick one');
  });
});
