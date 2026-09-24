import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Input } from './input';

describe('Input', () => {
  it('associates the label with the control', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInstanceOf(HTMLInputElement);
  });

  it('accepts typing', async () => {
    render(<Input label="Email" />);
    await userEvent.type(screen.getByLabelText('Email'), 'hi@example.com');
    expect(screen.getByLabelText('Email')).toHaveValue('hi@example.com');
  });

  it('links the description through aria-describedby', () => {
    render(<Input label="Email" description="We never share it." />);
    const input = screen.getByLabelText('Email');
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).not.toBeNull();
    expect(document.getElementById(describedBy ?? '')).toHaveTextContent('We never share it.');
  });

  it('marks itself invalid and links the error message', () => {
    render(<Input label="Email" error="Enter a valid address" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    const describedBy = input.getAttribute('aria-describedby') ?? '';
    expect(document.getElementById(describedBy)).toHaveTextContent('Enter a valid address');
  });

  it('links both description and error at once', () => {
    render(<Input label="Email" description="Work address." error="Required" />);
    const ids = (screen.getByLabelText('Email').getAttribute('aria-describedby') ?? '').split(' ');
    expect(ids).toHaveLength(2);
    expect(document.getElementById(ids[0] ?? '')).toHaveTextContent('Work address.');
    expect(document.getElementById(ids[1] ?? '')).toHaveTextContent('Required');
  });

  it('sets no aria-describedby when there is nothing to describe', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).not.toHaveAttribute('aria-describedby');
  });

  it('announces the error as an alert', () => {
    render(<Input label="Email" error="Required" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Required');
  });

  it('gives each instance its own ids', () => {
    render(
      <>
        <Input label="First" />
        <Input label="Second" />
      </>,
    );
    expect(screen.getByLabelText('First').id).not.toBe(screen.getByLabelText('Second').id);
  });
});
