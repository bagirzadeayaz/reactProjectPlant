import { useRef, type PointerEvent, type DragEvent, type MouseEvent } from 'react';

/** Horizontal gestures change slides; vertical gestures remain native page scrolling. */
export const useSwipe = (onSwipe: (direction: -1 | 1) => void) => {
  const start = useRef<{ x: number; y: number; id: number } | null>(null);
  const dragged = useRef(false);
  return {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      dragged.current = false;
      if (
        !event.isPrimary ||
        event.button !== 0 ||
        (event.target as Element).closest('button, input, select, textarea')
      )
        return;
      start.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      const origin = start.current;
      if (origin?.id !== event.pointerId) return;
      const dx = event.clientX - origin.x;
      const dy = event.clientY - origin.y;
      if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.3) dragged.current = true;
    },
    onPointerUp: (event: PointerEvent<HTMLElement>) => {
      const origin = start.current;
      start.current = null;
      if (origin?.id !== event.pointerId) return;
      const dx = event.clientX - origin.x;
      const dy = event.clientY - origin.y;
      if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        dragged.current = true;
        onSwipe(dx < 0 ? 1 : -1);
      }
    },
    onPointerCancel: () => {
      start.current = null;
    },
    onClickCapture: (event: MouseEvent<HTMLElement>) => {
      if (dragged.current && event.detail > 0) {
        event.preventDefault();
        event.stopPropagation();
        dragged.current = false;
      }
    },
    onDragStart: (event: DragEvent<HTMLElement>) => {
      event.preventDefault();
    },
  };
};
