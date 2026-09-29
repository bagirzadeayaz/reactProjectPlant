import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import type { CompanionPreferences } from '../../entities/companion';

interface Point {
  x: number;
  y: number;
}
const clamp = (value: number, max: number) => Math.max(0, Math.min(max, value));
const corner = (point: Point): Point => ({ x: Math.round(point.x), y: Math.round(point.y) });
const viewport = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
  navigation: document.querySelector('.mobile-navigation')?.getBoundingClientRect().height ?? 0,
});

/** Follow the pointer while held; a short directional drag selects a corner on release. */
export const useCompanionDrag = (
  saved: CompanionPreferences['position'],
  save: (position: CompanionPreferences['position']) => void,
  activate: () => void,
) => {
  const [size, setSize] = useState(viewport);
  const [draft, setDraft] = useState<Point | null>(null);
  const drag = useRef<{ pointer: number; start: Point; origin: Point; moved: boolean } | null>(
    null,
  );
  const suppressClick = useRef(false);
  const mobile = size.width <= 760;
  const width = mobile ? 64 : 88;
  const height = mobile ? 82 : 112;
  const top = mobile ? 84 : 100;
  const bottom = mobile ? Math.max(88, size.navigation + 12) : 20;
  const rangeX = Math.max(0, size.width - width - 24);
  const rangeY = Math.max(0, size.height - top - bottom - height);
  const position = draft ?? corner(saved ?? { x: 1, y: 1 });
  const left = 12 + position.x * rangeX;
  const y =
    Math.min(top, Math.max(12, size.height - height - bottom)) + position.y * rangeY;
  const bubbleWidth = mobile ? 180 : 220;
  const bubbleLeft = Math.max(
    12,
    Math.min(size.width - bubbleWidth - 12, left + width - bubbleWidth),
  );
  const bubbleBelow = y < 170;
  useEffect(() => {
    const resize = () => {
      setSize(viewport());
    };
    window.addEventListener('resize', resize);
    const frame = requestAnimationFrame(resize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, []);
  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (!event.isPrimary || event.button !== 0) return;
    suppressClick.current = false;
    drag.current = {
      pointer: event.pointerId,
      start: { x: event.clientX, y: event.clientY },
      origin: { x: position.x, y: rangeY ? clamp(y - top, rangeY) / rangeY : 0 },
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const active = drag.current;
    if (active?.pointer !== event.pointerId) return;
    const dx = event.clientX - active.start.x;
    const dy = event.clientY - active.start.y;
    if (!active.moved && Math.hypot(dx, dy) < 7) return;
    active.moved = true;
    suppressClick.current = true;
    setDraft({
      x: rangeX ? clamp(active.origin.x * rangeX + dx, rangeX) / rangeX : 0,
      y: rangeY ? clamp(active.origin.y * rangeY + dy, rangeY) / rangeY : 0,
    });
  };
  const finish = (event: PointerEvent<HTMLButtonElement>, cancelled: boolean) => {
    const active = drag.current;
    if (active?.pointer !== event.pointerId) return;
    drag.current = null;
    if (active.moved && !cancelled) {
      const dx = event.clientX - active.start.x;
      const dy = event.clientY - active.start.y;
      const origin = corner(active.origin);
      // Use direction rather than distance across the screen; ignore small wobble.
      save(
        Math.hypot(dx, dy) < 14
          ? origin
          : {
              x: Math.abs(dx) >= Math.abs(dy) * 0.55 ? (dx < 0 ? 0 : 1) : origin.x,
              y: Math.abs(dy) >= Math.abs(dx) * 0.55 ? (dy < 0 ? 0 : 1) : origin.y,
            },
      );
    }
    setDraft(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    if (!active.moved && !cancelled) {
      // Touch browsers can omit click after pointer capture changes its target.
      // Activate on release and consume a possible follow-up compatibility click.
      suppressClick.current = true;
      activate();
    }
  };
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const directions: Record<string, Point> = {
      ArrowLeft: { x: 0, y: position.y },
      ArrowRight: { x: 1, y: position.y },
      ArrowUp: { x: position.x, y: 0 },
      ArrowDown: { x: position.x, y: 1 },
    };
    const direction = directions[event.key];
    if (event.key === 'Home') {
      event.preventDefault();
      save(null);
    } else if (direction) {
      event.preventDefault();
      save(corner(direction));
    }
  };
  return {
    style: { left, top: Math.max(12, y), right: 'auto', bottom: 'auto' },
    dock: (saved?.y ?? 1) < 0.5 ? 'top' : 'bottom',
    bubbleStyle: {
      left: bubbleLeft,
      right: 'auto',
      top: bubbleBelow ? y + height + 10 : 'auto',
      bottom: bubbleBelow ? 'auto' : size.height - y + 10,
    },
    side: position.x < 0.5 ? 'left' : 'right',
    bubbleBelow,
    dragging: draft !== null,
    consumeDrag: () => {
      const consumed = suppressClick.current;
      suppressClick.current = false;
      return consumed;
    },
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: (e: PointerEvent<HTMLButtonElement>) => {
        finish(e, false);
      },
      onPointerCancel: (e: PointerEvent<HTMLButtonElement>) => {
        finish(e, true);
      },
      onLostPointerCapture: (e: PointerEvent<HTMLButtonElement>) => {
        finish(e, true);
      },
      onKeyDown,
    },
  };
};
