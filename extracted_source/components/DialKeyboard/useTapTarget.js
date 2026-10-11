import { useCallback, useRef } from 'react';
import { TAP } from './config';

/**
 * Press handlers for a button that lives inside a draggable surface.
 *
 * A plain onClick would also fire at the end of a drag that happens to finish
 * on top of the button, so this only counts a press whose finger stayed put —
 * the same movement budget the rings use to tell a tap from a drag.
 */
export function useTapTarget({ onTap, onGrab }) {
  const onTapRef = useRef(onTap);
  const onGrabRef = useRef(onGrab);
  onTapRef.current = onTap;
  onGrabRef.current = onGrab;

  const press = useRef({ pointerId: null, time: 0, travel: 0, x: 0, y: 0 });

  const onPointerDown = useCallback((event) => {
    const p = press.current;
    p.pointerId = event.pointerId;
    p.time = performance.now();
    p.travel = 0;
    p.x = event.clientX;
    p.y = event.clientY;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch (e) {}
    if (onGrabRef.current) onGrabRef.current();
  }, []);

  const onPointerMove = useCallback((event) => {
    const p = press.current;
    if (event.pointerId !== p.pointerId) return;
    p.travel += Math.hypot(event.clientX - p.x, event.clientY - p.y);
    p.x = event.clientX;
    p.y = event.clientY;
  }, []);

  const onPointerUp = useCallback((event) => {
    const p = press.current;
    if (event.pointerId !== p.pointerId) return;
    p.pointerId = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch (e) {}
    if (
      p.travel < TAP.maxTravelPx &&
      performance.now() - p.time < TAP.pressMaxDurationMs
    ) {
      if (onTapRef.current) onTapRef.current();
    }
  }, []);

  const onPointerCancel = useCallback(() => {
    press.current.pointerId = null;
  }, []);

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel };
}
