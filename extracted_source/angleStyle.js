/**
 * How the arc across the arm tips is drawn, remembered per browser.
 *
 * The arc is there so a reflex angle cannot be read as its non-reflex twin.
 * Two ways of saying that without competing with the figure: a soft blur, or
 * a dashed line. Opinions differed, so it is a setting.
 */

export const ANGLE_STYLE_KEY = 'angle.style.tipArc';

export const BLURRED = 'blurred';
export const DASHED = 'dashed';
export const OFF = 'off';
export const DEFAULT_ANGLE_STYLE = BLURRED;

/** Short notes on purpose: three of these sit side by side. */
export const ANGLE_STYLES = [
  { value: BLURRED, label: 'Blurry', note: 'Soft edge' },
  { value: DASHED, label: 'Dashed', note: 'Dashed line' },
  { value: OFF, label: 'Off', note: 'No arc' },
];

export function readAngleStyle() {
  try {
    const stored = localStorage.getItem(ANGLE_STYLE_KEY);
    return ANGLE_STYLES.some((style) => style.value === stored)
      ? stored
      : DEFAULT_ANGLE_STYLE;
  } catch (e) {
    return DEFAULT_ANGLE_STYLE;
  }
}

export function writeAngleStyle(value) {
  try {
    localStorage.setItem(ANGLE_STYLE_KEY, value);
  } catch (e) {}
}
