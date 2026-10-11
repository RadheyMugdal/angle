import { useCallback, useEffect, useRef } from 'react';
import { GEOMETRY, PHYSICS, TAP } from './config';
import { buzzDetent } from './haptics';

const DEG = 180 / Math.PI;

const modulo = (value, n) => ((value % n) + n) % n;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
/** Wraps a degree difference into (-180, 180] so 359° -> 1° reads as +2°. */
const wrapDegrees = (deg) => modulo(deg + 180, 360) - 180;
/** Ease in and out: the ring builds up speed and slows into the marker. */
const easeInOut = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** A ring rotated by `rotation` shows detent `index` at the top marker. */
export const rotationForIndex = (index, steps) => -index * (360 / steps);
export const indexForRotation = (rotation, steps) =>
  modulo(Math.round(-rotation / (360 / steps)), steps);

/**
 * Turns finger drags on `hitRef` into a smooth rotation of `ringRef`.
 *
 * The rotation is written straight to the DOM every animation frame — React
 * only hears about it when the selected detent actually changes, which is what
 * keeps the spin at 60fps while still updating the guess in real time.
 *
 * @param steps          number of detents on the ring
 * @param index          controlled detent index (the ring animates to it)
 * @param onIndexChange  called only for user-driven changes
 * @param disabled       ignore touches
 * @param onGrab         called when a finger lands on the ring
 */
export function useRotaryDial({
  steps,
  index,
  onIndexChange,
  disabled = false,
  onGrab,
}) {
  const ringRef = useRef(null);
  const hitRef = useRef(null);

  const onIndexChangeRef = useRef(onIndexChange);
  const onGrabRef = useRef(onGrab);
  const disabledRef = useRef(disabled);
  onIndexChangeRef.current = onIndexChange;
  onGrabRef.current = onGrab;
  disabledRef.current = disabled;

  const state = useRef({
    mode: 'idle', // 'idle' | 'drag' | 'spin' | 'settle' | 'glide'
    rotation: rotationForIndex(index, steps),
    velocity: 0, // deg/s
    target: 0, // detent rotation the spring is pulling towards
    index, // detent currently under the marker
    emitted: index, // last detent we told the parent about
    echoes: new Set(), // every detent published during the current motion
    fromUser: false, // is the current motion the finger's doing?
    pointerId: null,
    centerX: 0,
    centerY: 0,
    radius: 1,
    lastAngle: 0,
    lastTime: 0,
    frame: null,
    glideFrom: 0, // 'glide' is a timed ease between two rotations
    glideTo: 0,
    glideStart: 0,
    glideDuration: 0,
    // Gesture bookkeeping, reset on every pointerdown (see isTap).
    travel: 0, // finger path length in px
    spun: 0, // degrees of rotation applied
    downTime: 0,
    lastX: 0,
    lastY: 0,
    grabbedMoving: false, // finger landed on a ring that was still turning
  });

  const stepSize = 360 / steps;

  const paint = useCallback(() => {
    const ring = ringRef.current;
    if (ring) ring.style.transform = `rotate(${state.current.rotation}deg)`;
  }, []);

  /** Publishes the detent under the marker, if it changed. */
  const publish = useCallback(() => {
    const s = state.current;
    const next = indexForRotation(s.rotation, steps);
    if (next === s.index) return;
    s.index = next;
    if (!s.fromUser) return;
    buzzDetent();
    s.emitted = next;
    s.echoes.add(next);
    if (onIndexChangeRef.current) onIndexChangeRef.current(next);
  }, [steps]);

  const stopLoop = useCallback(() => {
    const s = state.current;
    if (s.frame !== null) cancelAnimationFrame(s.frame);
    s.frame = null;
  }, []);

  const detentNear = useCallback(
    (rotation) => Math.round(rotation / stepSize) * stepSize,
    [stepSize]
  );

  const tick = useCallback(
    (now) => {
      const s = state.current;
      let remaining = Math.min(now - s.lastTime, PHYSICS.maxFrameMs);
      s.lastTime = now;

      if (s.mode === 'glide') {
        // A timed ease, so it always finishes when it says it will.
        const t = Math.min(1, (now - s.glideStart) / s.glideDuration);
        s.rotation = s.glideFrom + (s.glideTo - s.glideFrom) * easeInOut(t);
        if (t >= 1) {
          s.rotation = modulo(s.glideTo, 360);
          s.velocity = 0;
          s.mode = 'idle';
        }
      }

      // Fixed sub-steps: the spring stays stable even after a dropped frame.
      while (remaining > 0 && (s.mode === 'spin' || s.mode === 'settle')) {
        const h = Math.min(remaining, PHYSICS.subStepMs) / 1000;
        remaining -= PHYSICS.subStepMs;

        if (s.mode === 'spin') {
          s.velocity *= Math.exp(-PHYSICS.friction * h);
          s.rotation += s.velocity * h;
          if (Math.abs(s.velocity) < PHYSICS.snapVelocity) {
            s.mode = 'settle';
            s.target = detentNear(
              s.rotation + s.velocity * PHYSICS.snapLookahead
            );
          }
        } else {
          const pull = -PHYSICS.stiffness * (s.rotation - s.target);
          s.velocity += (pull - PHYSICS.damping * s.velocity) * h;
          s.rotation += s.velocity * h;
          if (
            Math.abs(s.velocity) < PHYSICS.restVelocity &&
            Math.abs(s.rotation - s.target) < PHYSICS.restOffset
          ) {
            // Rest exactly on the detent, keeping the angle small & tidy.
            s.rotation = modulo(s.target, 360);
            s.velocity = 0;
            s.mode = 'idle';
          }
        }
      }

      paint();
      publish();

      if (s.mode === 'idle') {
        s.frame = null;
        s.fromUser = false;
      } else {
        s.frame = requestAnimationFrame(tick);
      }
    },
    [detentNear, paint, publish]
  );

  const startLoop = useCallback(() => {
    const s = state.current;
    if (s.frame !== null) return;
    s.lastTime = performance.now();
    s.frame = requestAnimationFrame(tick);
  }, [tick]);

  const onPointerDown = useCallback(
    (event) => {
      if (disabledRef.current) return;
      const hit = hitRef.current;
      if (!hit) return;

      const s = state.current;
      const rect = hit.getBoundingClientRect();
      // Grabbing a ring that is still turning stops it, and only stops it —
      // never treat that as a tap, or the dial jumps under the finger. A glide
      // carries no velocity, so this asks about the mode, not the speed.
      s.grabbedMoving = s.mode !== 'idle';
      s.centerX = rect.left + rect.width / 2;
      s.centerY = rect.top + rect.height / 2;
      s.radius = rect.width / 2 || 1;
      s.lastAngle =
        Math.atan2(event.clientY - s.centerY, event.clientX - s.centerX) * DEG;
      s.lastTime = performance.now();
      s.downTime = s.lastTime;
      s.lastX = event.clientX;
      s.lastY = event.clientY;
      s.travel = 0;
      s.spun = 0;
      s.pointerId = event.pointerId;
      s.velocity = 0;
      s.mode = 'drag';
      s.fromUser = true;

      stopLoop();
      try {
        hit.setPointerCapture(event.pointerId);
      } catch (e) {}
      if (onGrabRef.current) onGrabRef.current();
    },
    [stopLoop]
  );

  const onPointerMove = useCallback(
    (event) => {
      const s = state.current;
      if (s.mode !== 'drag' || event.pointerId !== s.pointerId) return;

      const dx = event.clientX - s.centerX;
      const dy = event.clientY - s.centerY;
      const angle = Math.atan2(dy, dx) * DEG;
      const now = performance.now();
      const elapsed = Math.max(now - s.lastTime, 1);
      const delta = wrapDegrees(angle - s.lastAngle);
      s.lastAngle = angle;
      s.lastTime = now;
      s.travel += Math.hypot(event.clientX - s.lastX, event.clientY - s.lastY);
      s.lastX = event.clientX;
      s.lastY = event.clientY;

      // Near the centre a tiny finger move is a huge angle: ignore it.
      if (Math.hypot(dx, dy) < s.radius * GEOMETRY.deadZoneRadius) return;

      s.rotation += delta;
      s.spun += Math.abs(delta);
      const sample = clamp(
        (delta / elapsed) * 1000,
        -PHYSICS.maxVelocity,
        PHYSICS.maxVelocity
      );
      s.velocity =
        s.velocity * (1 - PHYSICS.velocityBlend) +
        sample * PHYSICS.velocityBlend;

      paint();
      publish();
    },
    [paint, publish]
  );

  /**
   * Which detent is under this screen point, or null if the point is in the
   * middle dead zone. Label `i` is drawn at `i * stepSize` clockwise from the
   * top and the whole layer is turned by `rotation`.
   */
  const detentAtPoint = useCallback(
    (clientX, clientY) => {
      const s = state.current;
      const dx = clientX - s.centerX;
      const dy = clientY - s.centerY;
      if (Math.hypot(dx, dy) < s.radius * GEOMETRY.deadZoneRadius) return null;
      const fromTop = Math.atan2(dx, -dy) * DEG;
      return modulo(Math.round((fromTop - s.rotation) / stepSize), steps);
    },
    [stepSize, steps]
  );

  /** Turn `index` up to the marker, shortest way round. */
  const glideTo = useCallback(
    (index, fromUser) => {
      const s = state.current;
      const distance = wrapDegrees(rotationForIndex(index, steps) - s.rotation);
      s.fromUser = fromUser;
      s.velocity = 0;
      s.glideFrom = s.rotation;
      s.glideTo = s.rotation + distance;
      s.glideStart = performance.now();
      s.glideDuration = clamp(
        PHYSICS.glideMinMs + Math.abs(distance) * PHYSICS.glideMsPerDegree,
        PHYSICS.glideMinMs,
        PHYSICS.glideMaxMs
      );
      s.mode = 'glide';
      stopLoop();
      startLoop();
    },
    [startLoop, stopLoop, steps]
  );

  /**
   * A tap is a gesture that barely moved, was over quickly, and did not begin
   * by catching a moving ring. Anything else is a drag — see TAP in config.js
   * for why this errs so far towards "drag".
   */
  const isTap = useCallback(() => {
    const s = state.current;
    return (
      !s.grabbedMoving &&
      s.travel < TAP.maxTravelPx &&
      s.spun < TAP.maxRotationSteps * stepSize &&
      performance.now() - s.downTime < TAP.maxDurationMs
    );
  }, [stepSize]);

  const onPointerUp = useCallback(
    (event) => {
      const s = state.current;
      if (s.mode !== 'drag' || event.pointerId !== s.pointerId) return;

      try {
        hitRef.current?.releasePointerCapture(event.pointerId);
      } catch (e) {}
      s.pointerId = null;

      // Tapped a number: bring it up to the marker. Use the last position we
      // actually saw — a pointerup does not always carry usable coordinates.
      if (isTap()) {
        const tapped = detentAtPoint(s.lastX, s.lastY);
        if (tapped !== null && tapped !== s.index) {
          glideTo(tapped, true);
          return;
        }
      }

      // Finger stopped before lifting => the user aimed, don't fling.
      if (performance.now() - s.lastTime > PHYSICS.staleReleaseMs) {
        s.velocity = 0;
      }

      if (Math.abs(s.velocity) > PHYSICS.snapVelocity) {
        s.mode = 'spin';
      } else {
        s.mode = 'settle';
        s.target = detentNear(s.rotation + s.velocity * PHYSICS.snapLookahead);
      }
      startLoop();
    },
    [detentAtPoint, detentNear, glideTo, isTap, startLoop]
  );

  // Draw the starting position before the first paint.
  useEffect(() => {
    paint();
    return stopLoop;
  }, [paint, stopLoop]);

  // The value changed somewhere else (typed): glide to it, silently.
  //
  // A turning ring publishes a value on every detent, and each of those comes
  // back here as a prop — often several frames late, by which time the ring
  // has moved on. Those echoes must not be mistaken for someone setting the
  // value, or every spin gets yanked back to where it was a moment ago. Any
  // value we published during this motion is therefore ignored, and the whole
  // record is dropped as soon as the parent is level with us again.
  useEffect(() => {
    const s = state.current;
    if (s.mode === 'idle' && index === s.emitted) {
      s.echoes.clear();
      return;
    }
    if (index === s.index || s.mode === 'drag' || s.echoes.has(index)) return;
    glideTo(index, false);
  }, [index, glideTo]);

  /** Move the ring from outside the hook, e.g. the centre reset button. */
  const glideToIndex = useCallback(
    (target) => glideTo(target, false),
    [glideTo]
  );

  return {
    ringRef,
    hitRef,
    glideTo: glideToIndex,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    },
  };
}
