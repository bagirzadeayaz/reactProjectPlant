import { useState } from 'react';
import { Button, Modal, Section, useToast } from '../../../shared/ui';

const COPY = {
  title: 'Overlays',
  openModal: 'Open modal',
  modalTitle: 'Confirm removal',
  modalClose: 'Close dialog',
  modalBody: 'Escape closes this, Tab stays inside, and focus returns to the trigger.',
  cancel: 'Cancel',
  confirm: 'Confirm',
  toastInfo: 'Show info toast',
  toastError: 'Show error toast',
  infoMessage: 'Added to cart',
  errorMessage: 'Could not add to cart',
} as const;

/** Dev-only showcase. Strings stay in COPY so the i18n pass in prompt 6 is mechanical. */
export const OverlaysSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { show } = useToast();

  return (
    <Section title={COPY.title} titleId="ui-kit-overlays">
      <div className="flex flex-wrap gap-gutter">
        <Button
          onClick={() => {
            setIsOpen(true);
          }}
        >
          {COPY.openModal}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            show({ message: COPY.infoMessage });
          }}
        >
          {COPY.toastInfo}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            show({ message: COPY.errorMessage, tone: 'error', duration: 0 });
          }}
        >
          {COPY.toastError}
        </Button>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        title={COPY.modalTitle}
        closeLabel={COPY.modalClose}
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsOpen(false);
              }}
            >
              {COPY.cancel}
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setIsOpen(false);
              }}
            >
              {COPY.confirm}
            </Button>
          </>
        }
      >
        {COPY.modalBody}
      </Modal>
    </Section>
  );
};
