import type React from 'react';

/** Tracks a mouse or touch drag on window until release, keeping the resize cursor active. */
export function startDrag(
  event: React.PointerEvent,
  cursor: 'col-resize' | 'row-resize',
  onMove: (ev: PointerEvent) => void,
): void {
  event.preventDefault();
  const onPointerUp = () => {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerUp);
    document.body.style.cursor = '';
  };
  document.body.style.cursor = cursor;
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);
}
