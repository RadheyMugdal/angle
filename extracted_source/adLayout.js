import { css } from 'styled-components';

/**
 * Where the left sidebar ad lives.
 *
 * It used to place itself with `transform: translateX(-100%)`, which meant the
 * served creative decided where it landed — and it always landed 80px inside
 * the content column, on top of the account icon, at every viewport width.
 *
 * Here the rail is pinned relative to the column instead: its right edge is
 * always one gutter to the left of the column, so it stays beside the game on
 * wide screens and can never reach the header.
 *
 * Between RAIL_FROM and COLUMN_CENTRED_FROM there isn't room for the rail
 * beside a centred column, so the column shifts right and the pair is centred
 * together. That keeps the unit visible down to ~900px rather than giving up
 * the inventory. Above COLUMN_CENTRED_FROM the rail fits without moving
 * anything, and the column returns to dead centre.
 *
 * RAIL_FROM must stay in step with the sidebar activation width in ads.js:
 * activating a unit whose container isn't in a sane place is what caused the
 * whole problem.
 */

export const RAIL_WIDTH = 300;
export const RAIL_GUTTER = 20;
export const RAIL_SPACE = RAIL_WIDTH + RAIL_GUTTER;
export const COLUMN_WIDTH = 520;
export const RAIL_FROM = 900;
export const COLUMN_CENTRED_FROM = 1200;

/** For the page container: reserves the rail's space in the shifted band. */
export const railSpacing = css`
  position: relative;
  @media (min-width: ${RAIL_FROM}px) and (max-width: ${COLUMN_CENTRED_FROM -
    0.02}px) {
    padding-left: ${RAIL_SPACE}px;
  }
`;

/** For the rail: right edge one gutter clear of the column's left edge. */
export const railPlacement = css`
  display: none;
  position: absolute;
  top: 80px;
  width: ${RAIL_WIDTH}px;
  z-index: 0;

  @media (min-width: ${RAIL_FROM}px) {
    display: block;
    /* Column centre sits half a rail right of the page centre in this band. */
    right: calc(50% + ${COLUMN_WIDTH / 2 - RAIL_SPACE / 2 + RAIL_GUTTER}px);
  }

  @media (min-width: ${COLUMN_CENTRED_FROM}px) {
    right: calc(50% + ${COLUMN_WIDTH / 2 + RAIL_GUTTER}px);
  }
`;
