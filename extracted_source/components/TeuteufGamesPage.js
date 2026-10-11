import styled from 'styled-components';
import { TeuteufGames } from '@teuteuf-games/teuteuf-games';
import { PageShell } from './PageShell';

/**
 * `/teuteuf-games` — the "More games" page, laid out the way the other Teuteuf
 * games do it: the usual header, a back link, then the shared games component.
 *
 * That component ships no CSS of its own (it is written for a Tailwind host,
 * and Angle has no Tailwind), so the utilities it uses are recreated below,
 * scoped to `GamesScope` so nothing leaks into the rest of the app. The `md:`
 * rules must stay last: that source order is what lets `md:grid` beat the
 * `hidden` on the same element, exactly as it does in Tailwind.
 */

const GamesScope = styled.div`
  a {
    color: inherit;
    text-decoration: none;
  }

  /* layout */
  .flex {
    display: flex;
  }
  .grid {
    display: grid;
  }
  .hidden {
    display: none;
  }
  .flex-col {
    flex-direction: column;
  }
  .flex-row {
    flex-direction: row;
  }
  .relative {
    position: relative;
  }
  .absolute {
    position: absolute;
  }
  .w-full {
    width: 100%;
  }
  .justify-center {
    justify-content: center;
  }
  .items-start {
    align-items: flex-start;
  }
  .items-center {
    align-items: center;
  }
  .items-end {
    align-items: flex-end;
  }
  .grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .right-0 {
    right: 0;
  }
  .top-0 {
    top: 0;
  }
  .z-10 {
    z-index: 10;
  }
  .z-auto {
    z-index: auto;
  }
  .-translate-y-1\\/2 {
    transform: translateY(-50%);
  }
  .absolute.top-0.-translate-y-1\\/2.translate-x-1\\/4 {
    transform: translate(25%, -50%);
  }

  /* spacing */
  .my-4 {
    margin-top: 1rem;
    margin-bottom: 1rem;
  }
  .mt-4 {
    margin-top: 1rem;
  }
  .mb-4 {
    margin-bottom: 1rem;
  }
  .gap-1 {
    gap: 0.25rem;
  }
  .gap-2 {
    gap: 0.5rem;
  }
  .gap-3 {
    gap: 0.75rem;
  }
  .gap-4 {
    gap: 1rem;
  }
  .gap-x-3 {
    column-gap: 0.75rem;
  }
  .gap-y-6 {
    row-gap: 1.5rem;
  }
  .p-3 {
    padding: 0.75rem;
  }
  .p-4 {
    padding: 1rem;
  }
  .pt-8 {
    padding-top: 2rem;
  }
  .px-2 {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  .py-1 {
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
  }

  /* type */
  .text-center {
    text-align: center;
  }
  .text-xs {
    font-size: 0.75rem;
    line-height: 1rem;
  }
  .text-sm {
    font-size: 0.875rem;
    line-height: 1.25rem;
  }
  .text-base {
    font-size: 1rem;
    line-height: 1.5rem;
  }
  .text-lg {
    font-size: 1.125rem;
    line-height: 1.75rem;
  }
  .text-xl {
    font-size: 1.25rem;
    line-height: 1.75rem;
  }
  .font-bold {
    font-weight: 700;
  }
  .leading-none {
    line-height: 1;
  }
  .text-white {
    color: #ffffff;
  }

  /* decoration */
  .rounded-md {
    border-radius: 0.375rem;
  }
  .rounded-full {
    border-radius: 9999px;
  }
  .border-2 {
    border: 2px solid #e5e7eb;
  }
  .bg-green-600 {
    background-color: #16a34a;
  }
  .bg-red-500 {
    background-color: #ef4444;
  }
  .w-10 {
    width: 2.5rem;
  }
  .h-10 {
    height: 2.5rem;
  }
  a.hover\\:bg-gray-100:hover {
    background-color: #f3f4f6;
  }

  h3,
  h5 {
    margin: 0;
  }
  h5 {
    color: #6b7280;
  }

  @media (prefers-color-scheme: dark) {
    h5 {
      color: #9aa0a8;
    }
    .border-2 {
      border-color: #2b2d31;
    }
    a.hover\\:bg-gray-100:hover {
      background-color: #26282d;
    }
  }

  /* Tailwind's md: breakpoint — keep last so these win on source order. */
  @media (min-width: 768px) {
    .md\\:hidden {
      display: none;
    }
    .md\\:grid {
      display: grid;
    }
    .md\\:text-lg {
      font-size: 1.125rem;
      line-height: 1.75rem;
    }
  }
`;

export function TeuteufGamesPage() {
  return (
    <PageShell>
      <GamesScope>
        <TeuteufGames languageCode="en" utmSource="angle" />
      </GamesScope>
    </PageShell>
  );
}
