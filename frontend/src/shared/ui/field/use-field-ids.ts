import { useId } from 'react';

export interface FieldIds {
  inputId: string;
  descriptionId: string | undefined;
  errorId: string | undefined;
  /** Value for `aria-describedby`, or undefined when there is nothing to describe. */
  describedBy: string | undefined;
  hasError: boolean;
}

/**
 * Generates the ids a labelled control needs and wires `aria-describedby`.
 *
 * Both the hint and the error message must be reachable from the control, and
 * both may be absent, so the list is built here once rather than in each
 * field component.
 */
export const useFieldIds = (
  hasDescription: boolean,
  error: string | undefined,
  providedId: string | undefined,
): FieldIds => {
  const generatedId = useId();
  const inputId = providedId ?? generatedId;
  const descriptionId = hasDescription ? `${inputId}-description` : undefined;
  const errorId = error !== undefined && error !== '' ? `${inputId}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined;

  return {
    inputId,
    descriptionId,
    errorId,
    describedBy,
    hasError: errorId !== undefined,
  };
};
