import { useMemo } from 'react';
import styled from 'styled-components';
import { DateTime } from 'luxon';
import { PageShell } from './PageShell';
import { ResultGrid } from './ResultGrid';
import { ShareResultButton } from './ShareResultButton';
import { MAX_GUESSES } from '../constants';
import { getStatsData } from '../stats';
import { useGuesses } from '../hooks/useGuesses';
import { getPuzzleNumber } from '../share';

/**
 * `/stats` — today's round first, then the long game.
 *
 * The two are kept plainly apart: what happened in this puzzle, and what has
 * happened across all of them. Only the first is shareable.
 */

const SectionLabel = styled.h2`
  font-size: 0.72rem;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: #8b93a1;
  margin: 1.6rem 0 0.5rem;
  font-weight: normal;
`;

const Card = styled.div`
  border-radius: 14px;
  padding: 1rem 1.1rem;
  background-color: #f4f4f5;
  /* Centred: it reads as the round's result, the same as the modal does. */
  text-align: ${({ $centred }) => ($centred ? 'center' : 'left')};
  @media (prefers-color-scheme: dark) {
    background-color: #1b1c1f;
  }
`;

const PuzzleName = styled.div`
  font-size: 0.8rem;
  color: #8b93a1;
`;

const Outcome = styled.div`
  font-size: 1.5rem;
  font-family: 'Boston-Regular';
  color: ${({ $muted }) => ($muted ? 'inherit' : '#df6247')};
  margin-top: 1px;
`;

const OutcomeNote = styled.div`
  font-size: 0.9rem;
  color: #6b7280;
  margin-top: 2px;
  @media (prefers-color-scheme: dark) {
    color: #9aa0a8;
  }
`;

const Grid = styled.div`
  display: flex;
  justify-content: center;
  margin: 1rem 0 0.2rem;
`;

/** Drawn rather than typed: no dependence on the device's emoji font. */

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 1rem;
`;

const PlayLink = styled.a`
  display: inline-flex;
  align-items: center;
  padding: 0.6rem 1.1rem;
  border-radius: 10px;
  font-size: 1rem;
  color: #df6247;
  text-decoration: none;
  background-color: rgba(223, 98, 71, 0.12);
  :hover {
    background-color: rgba(223, 98, 71, 0.2);
  }
`;

const Tiles = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
`;

const Tile = styled.div`
  border-radius: 12px;
  padding: 0.7rem 0.35rem;
  text-align: center;
  background-color: #f4f4f5;
  @media (prefers-color-scheme: dark) {
    background-color: #1b1c1f;
  }
`;

const TileValue = styled.div`
  font-size: 1.6rem;
  line-height: 1.1;
  font-family: 'Boston-Regular';
`;

const TileLabel = styled.div`
  font-size: 0.68rem;
  color: #8b93a1;
  margin-top: 2px;
`;

const DistRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
  font-size: 0.9rem;
`;

const DistIndex = styled.span`
  width: 0.9rem;
  color: #8b93a1;
  flex: none;
`;

/** Full-width track so every row ends in the same place. */
const DistTrack = styled.span`
  flex: 1;
  height: 1.35rem;
  border-radius: 6px;
  overflow: hidden;
  background-color: #e9eaec;
  @media (prefers-color-scheme: dark) {
    background-color: #232529;
  }
`;

const DistFill = styled.span`
  display: block;
  height: 100%;
  border-radius: 6px;
  width: ${({ $share }) => Math.max($share * 100, 0)}%;
  background-color: ${({ $active }) => ($active ? '#df6247' : '#c8ccd2')};
  transition: width 260ms ease;
  @media (prefers-color-scheme: dark) {
    background-color: ${({ $active }) => ($active ? '#df6247' : '#3a3f46')};
  }
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const DistCount = styled.span`
  width: 1.4rem;
  flex: none;
  text-align: right;
  color: #6b7280;
  @media (prefers-color-scheme: dark) {
    color: #9aa0a8;
  }
`;

const Hint = styled.span`
  font-size: 0.85rem;
  color: #6b7280;
  @media (prefers-color-scheme: dark) {
    color: #9aa0a8;
  }
`;

const Empty = styled.div`
  font-size: 0.95rem;
  color: #6b7280;
  @media (prefers-color-scheme: dark) {
    color: #9aa0a8;
  }
`;

export function StatsPage() {
  const dayString = useMemo(() => DateTime.now().toFormat('yyyy-MM-dd'), []);
  const [guesses] = useGuesses(dayString);

  const stats = getStatsData();
  const win = guesses.some((guess) => guess.delta === 0);
  const finished = win || guesses.length >= MAX_GUESSES;
  // Every guess carries its distance from the answer, so any one of them
  // gives the answer back without re-deriving the day's puzzle.
  const answer = guesses.length ? guesses[0].value - guesses[0].delta : null;

  const maxInDistribution = Math.max(
    1,
    ...Object.values(stats.guessDistribution)
  );

  return (
    <PageShell>
      <SectionLabel>Today</SectionLabel>
      <Card $centred>
        <PuzzleName>
          Angle #{getPuzzleNumber(dayString)} ·{' '}
          {DateTime.fromFormat(dayString, 'yyyy-MM-dd').toFormat('d LLL yyyy')}
        </PuzzleName>

        {guesses.length === 0 && (
          <>
            <Outcome $muted>Not played yet</Outcome>
            <Actions>
              <PlayLink href="/">Play today's angle</PlayLink>
            </Actions>
          </>
        )}

        {guesses.length > 0 && (
          <>
            <Outcome $muted={!win}>
              {win
                ? `Solved in ${guesses.length}/${MAX_GUESSES}`
                : finished
                  ? 'Not solved'
                  : `${guesses.length} of ${MAX_GUESSES} guesses used`}
            </Outcome>
            {finished && answer != null && (
              <OutcomeNote>The angle was {answer}°</OutcomeNote>
            )}

            <Grid>
              <ResultGrid guesses={guesses} center />
            </Grid>

            <Actions>
              {finished ? (
                <ShareResultButton
                  dayString={dayString}
                  guesses={guesses}
                  win={win}
                  center
                  fullWidth
                />
              ) : (
                <>
                  <PlayLink href="/">Keep playing</PlayLink>
                  <Hint>Finish the round to share it</Hint>
                </>
              )}
            </Actions>
          </>
        )}
      </Card>

      <SectionLabel>All time</SectionLabel>
      <Tiles>
        <Tile>
          <TileValue>{stats.played}</TileValue>
          <TileLabel>Played</TileLabel>
        </Tile>
        <Tile>
          <TileValue>{Math.round(stats.winRatio * 100)}</TileValue>
          <TileLabel>Win %</TileLabel>
        </Tile>
        <Tile>
          <TileValue>{stats.currentStreak}</TileValue>
          <TileLabel>Streak</TileLabel>
        </Tile>
        <Tile>
          <TileValue>{stats.maxStreak}</TileValue>
          <TileLabel>Best streak</TileLabel>
        </Tile>
      </Tiles>

      <SectionLabel>Guess distribution</SectionLabel>
      <Card>
        {stats.played === 0 ? (
          <Empty>Play a round and your distribution shows up here.</Empty>
        ) : (
          Object.entries(stats.guessDistribution).map(([tries, count]) => (
            <DistRow key={tries}>
              <DistIndex>{tries}</DistIndex>
              <DistTrack>
                <DistFill
                  $share={count / maxInDistribution}
                  $active={win && guesses.length === Number(tries)}
                />
              </DistTrack>
              <DistCount>{count}</DistCount>
            </DistRow>
          ))
        )}
      </Card>
    </PageShell>
  );
}
