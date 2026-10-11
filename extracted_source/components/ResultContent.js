import styled from 'styled-components';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import { MAX_GUESSES } from '../constants';
import { roundSolved } from '../construct/daily';
import { getPuzzleNumber } from '../share';
import { ResultGrid } from './ResultGrid';
import { ShareScore } from './ShareScore';

/**
 * What the day's result says, in the two places it gets said.
 *
 * `page` is the daily's own ending, where there is a whole column to use and
 * the nav above already says whose game this is. Without it this is the card
 * that opens over an unfinished daily, where the room is a phone-width box and
 * the branding has to come with it.
 *
 * One component for both so the wording, the grid and the buttons cannot drift
 * apart — only the room they are given changes.
 */

const Brand = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
`;

const BrandLogo = styled.img`
  height: 1.35rem;
`;

const BrandText = styled.span`
  font-size: 1.35rem;
  line-height: 1;
  font-family: 'Boston-Regular';
  color: #df6247;
`;

const Puzzle = styled.div`
  font-size: 0.78rem;
  color: #8b93a1;
  margin-top: 3px;
`;

const Outcome = styled.div`
  font-family: 'Boston-Regular';
  line-height: 1.15;
  font-size: ${({ $page }) => ($page ? '2.3rem' : '1.6rem')};
  margin-top: ${({ $page }) => ($page ? '0' : '0.9rem')};
  color: ${({ $win }) => ($win ? '#df6247' : 'inherit')};
`;

const AnswerNote = styled.div`
  margin-top: ${({ $page }) => ($page ? '0.4rem' : '0')};
  font-size: ${({ $page }) => ($page ? '1rem' : '0.95rem')};
  color: #6b7280;
  @media (prefers-color-scheme: dark) {
    color: #9aa0a8;
  }
`;

const NextRound = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  margin-top: 0.9rem;
  padding: 0.65rem 1.2rem;
  border: none;
  border-radius: 12px;
  font-family: 'Boston-Regular';
  font-size: 1rem;
  color: #df6247;
  background-color: rgba(223, 98, 71, 0.12);
  cursor: pointer;
  svg {
    font-size: 1.15rem;
  }
  :hover {
    background-color: rgba(223, 98, 71, 0.2);
  }
`;

const Round2Line = styled.div`
  margin-top: 0.9rem;
  margin-bottom: 10px;
  padding-top: 0.7rem;
  border-top: 1px solid #eceef1;
  font-size: 0.95rem;
  color: #6b7280;
  @media (prefers-color-scheme: dark) {
    border-top-color: #2b2d31;
    color: #9aa0a8;
  }
`;

const GridWrap = styled.div`
  display: flex;
  justify-content: center;
  margin: ${({ $page }) => ($page ? '1.4rem 0 1.2rem' : '1rem 0 1.1rem')};
`;

const Links = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.1rem;
  flex-wrap: wrap;
`;

const StatsLink = styled.a`
  display: inline-block;
  margin-top: 0.9rem;
  font-size: 0.85rem;
  color: #df6247;
  text-decoration: none;
  :hover {
    text-decoration: underline;
  }
`;

export function ResultContent({
  win,
  guesses,
  answer,
  dayString,
  round2,
  onStartRound2,
  page = false,
}) {
  const playedRound2 = Boolean(
    round2 && !round2.skipped && round2.attempts?.length > 0
  );
  const madeRound2 = roundSolved(round2, answer);
  const outcome = win ? `Solved in ${guesses.length}/${MAX_GUESSES}` : 'Not solved';

  return (
    <>
      {page ? (
        <>
          <Outcome $page $win={win}>
            {outcome}
          </Outcome>
          <AnswerNote $page>
            Angle #{getPuzzleNumber(dayString)} · the angle was {answer}°
          </AnswerNote>
        </>
      ) : (
        <>
          <Brand>
            <BrandLogo src="/images/angle.svg" alt="" />
            <BrandText>ANGLE</BrandText>
          </Brand>
          <Puzzle>#{getPuzzleNumber(dayString)}</Puzzle>
          <Outcome $win={win}>{outcome}</Outcome>
          <AnswerNote>The angle was {answer}°</AnswerNote>
        </>
      )}

      <GridWrap $page={page}>
        <ResultGrid guesses={guesses} />
      </GridWrap>

      {playedRound2 && (
        <Round2Line data-testid="result-round2">
          {madeRound2
            ? `Round 2: made it in ${round2.attempts.length}`
            : 'Round 2: not made'}
        </Round2Line>
      )}

      <ShareScore
        dayString={dayString}
        guesses={guesses}
        win={win}
        round2={round2}
      />

      {/* Skipped round 2 is not a locked door: offer it as the next step,
          and only fall back to the arcade once it has been played. */}
      {!playedRound2 && onStartRound2 && (
        <NextRound onClick={onStartRound2} data-testid="modal-start-round-2">
          <ArchitectureIcon />
          Round 2 · Make {answer}°
        </NextRound>
      )}

      <Links>
        {playedRound2 && (
          <StatsLink href="/construct">Keep playing &#8594;</StatsLink>
        )}
        <StatsLink href="/stats">All stats &#8594;</StatsLink>
      </Links>
    </>
  );
}
