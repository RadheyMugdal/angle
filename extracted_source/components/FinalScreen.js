import styled from 'styled-components';
import { ResultContent } from './ResultContent';

/**
 * Where the daily ends once both rounds are done.
 *
 * A page, not a card on one: no panel, no border, no shadow — the column is
 * the card. The nav above already carries the branding, so this opens straight
 * on the result and gives it the room a box could not.
 *
 * One of the daily's three screens, and the one a finished day opens on. It
 * leads back to round one, which leads to round two, which leads here again.
 */

const Screen = styled.div`
  width: 100%;
  max-width: 380px;
  margin: 0 auto;
  padding: 1.6rem 1rem 0;
  box-sizing: border-box;
  text-align: center;
  animation: result-in 340ms cubic-bezier(0.2, 0.7, 0.3, 1) both;
  @keyframes result-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Footer = styled.div`
  margin-top: 1.6rem;
  padding-top: 1rem;
  border-top: 1px solid #eceef1;
  @media (prefers-color-scheme: dark) {
    border-top-color: #2b2d31;
  }
`;

const Back = styled.button`
  padding: 0.4rem 0.6rem;
  border: none;
  background: none;
  font-family: 'Boston-Regular';
  font-size: 0.9rem;
  color: #8b93a1;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  :hover {
    color: #df6247;
  }
`;

export function FinalScreen({
  win,
  guesses,
  answer,
  dayString,
  round2,
  onStartRound2,
  onBack,
}) {
  return (
    <Screen data-testid="final-screen">
      <ResultContent
        page
        win={win}
        guesses={guesses}
        answer={answer}
        dayString={dayString}
        round2={round2}
        onStartRound2={onStartRound2}
      />
      <Footer>
        <Back onClick={onBack} data-testid="final-back">
          &#8592; Back to the game
        </Back>
      </Footer>
    </Screen>
  );
}
