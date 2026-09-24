import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Textarea } from './textarea';

describe('Textarea', () => {
  it('associates the label with the control', () => {
    render(<Textarea label="Notes" />);
    expect(screen.getByLabelText('Notes')).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('accepts multi-line input', async () => {
    render(<Textarea label="Notes" />);
    const field = screen.getByLabelText('Notes');
    await userEvent.type(field, 'line one{enter}line two');
    expect(field).toHaveValue('line one\nline two');
  });

  it('marks itself invalid and links the error', () => {
    render(<Textarea label="Notes" error="Too short" />);
    const field = screen.getByLabelText('Notes');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    const describedBy = field.getAttribute('aria-describedby') ?? '';
    expect(document.getElementById(describedBy)).toHaveTextContent('Too short');
  });

  it('defaults to four rows and honours an override', () => {
    const { rerender } = render(<Textarea label="Notes" />);
    expect(screen.getByLabelText('Notes')).toHaveAttribute('rows', '4');
    rerender(<Textarea label="Notes" rows={8} />);
    expect(screen.getByLabelText('Notes')).toHaveAttribute('rows', '8');
  });
});
