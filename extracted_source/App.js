import seedrandom from 'seedrandom';
import { ToastContainer, Flip } from 'react-toastify';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styled from 'styled-components';
import { Angle } from './components/Angle';
import { DateTime } from 'luxon';
import { Guesses } from './components/Guesses';
import { useState, useMemo, useEffect } from 'react';
import { useGuesses } from './hooks/useGuesses';
import { MAX_GUESSES } from './constants';
import { EMPTY, parseGuess } from './guessInput';
import AdSpace from './components/AdSpace';
import { Attribution } from './components/Attribution';
import { HowToModal } from './components/HowToModal';
import { FinalScreen } from './components/FinalScreen';
import useUser from './hooks/useUser';
import AccountsUpdateComponent from './components/AccountsUpdateComponent';
import { checkForConsent } from './ads';
import { trackOncePerDay } from './analytics';
import { railPlacement, railSpacing } from './adLayout';
import ScrollingBlackFridayPrompt from './components/ScrollingBlackFridayPrompt';
import {
  buzzWrongGuess,
  DialKeyboard,
  useIsMobileDevice,
} from './components/DialKeyboard';
import { NavBar } from './components/Nav';
import { DailyRound } from './components/Construct/DailyRound';
import { RoundSteps } from './components/RoundSteps';
import {
  isRoundFinished,
  loadDailyRound,
  reconcileDailyRound,
  saveDailyRound,
} from './construct/daily';
import { AngleField } from './components/AngleField';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import { getInitialHelpEyeOpen } from './helpEye';

const Main = styled.div`
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  text-align: center;
`;

const SidebarAd = styled.div`
  ${railPlacement}
`;

const BigContainer = styled.div`
  ${railSpacing}
  display: flex;
  text-align: center;
  /* Grows with its content and lets the document scroll — see index.css. */
  flex: 1 0 auto;
  width: 100%;
  justify-content: flex-start;
  flex-direction: column;
  align-items: center;
  @media (prefers-color-scheme: dark) {
    background-color: #121212;
  }
`;

const Button = styled.button`
  padding: 10px;
  border-radius: 10px;
  border-width: 0px;
  font-family: 'Boston-Regular';
  background-color: lightgrey;
  :active {
    background-color: darkgrey;
  }
  @media (prefers-color-scheme: dark) {
    background-color: #1f2023;
    color: #dadada;
  }
`;

const InputArea = styled.div`
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  /*
   * Real separation between the step buttons and Guess!. Stepping is a
   * repeated tap and Guess! spends one of only four attempts, so a thumb
   * drifting a few pixels right should not cost a go. Tightened on very
   * narrow screens, where the row would otherwise not fit.
   */
  gap: 1rem;
  @media (max-width: 359px) {
    gap: 0.5rem;
  }
`;

/**
 * Takes the place of the input row once the round is over: one line, so the
 * board, the attempts and the guesses stay where they were. The result itself
 * lives in the modal this reopens.
 */
const SeeResults = styled.button`
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  padding: 0.55rem 1.2rem;
  border: none;
  border-radius: 10px;
  font-family: 'Boston-Regular';
  font-size: 1rem;
  color: #df6247;
  background-color: rgba(223, 98, 71, 0.12);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  :hover {
    background-color: rgba(223, 98, 71, 0.2);
  }
`;

const Round2Offer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  /* Arrives a beat after the answer lands, so it reads as the next step. */
  animation: round2-in 320ms ease-out both;
  @keyframes round2-in {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const StartRound2 = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 1rem;
  padding: 0.7rem 1.4rem;
  border: none;
  border-radius: 12px;
  font-family: 'Boston-Regular';
  font-size: 1.05rem;
  color: #ffffff;
  background-color: #df6247;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  svg {
    font-size: 1.2rem;
  }
  :hover {
    background-color: #c9553c;
  }
`;

const FinishHere = styled.button`
  border: none;
  background: none;
  padding: 0.35rem 0.6rem;
  font-family: 'Boston-Regular';
  font-size: 0.85rem;
  color: #8b93a1;
  cursor: pointer;
  :hover {
    color: #df6247;
    text-decoration: underline;
  }
`;

const Attempts = styled.div`
  margin-bottom: 0.5rem;
  .span {
    font-weight: bold;
  }
  @media (prefers-color-scheme: dark) {
    color: #fff;
  }
`;

const AdContainer = styled.div`
  width: 100%;
  margin-top: auto;
  bottom: 0px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  gap: 1rem;
`;

const getDayString = () => {
  return DateTime.now().toFormat('yyyy-MM-dd');
};

const DEV_MODE = false;
function App() {
  const dayString = useMemo(getDayString, []);
  const [angle1, setAngle1] = useState(
    (DEV_MODE ? Math.random() : seedrandom.alea(dayString)()) * 2 * Math.PI
  );
  const [angle2, setAngle2] = useState(
    (DEV_MODE
      ? Math.random()
      : seedrandom.alea(dayString + 'otherrandomstring')()) *
      2 *
      Math.PI
  );
  const [guess, setGuess] = useState('');
  const [guesses, addGuess] = useGuesses(dayString);
  const [end, setEnd] = useState(false);
  const [win, setWin] = useState(false);
  const { user, setData } = useUser();
  const isMobile = useIsMobileDevice();
  // Bumped to open a modal from the nav bar or the menu.
  const [howToSignal, setHowToSignal] = useState(0);
  // Round 2 — make the angle you just identified. Its own storage, so streaks
  // and the distribution never depend on whether anyone plays it.
  const [round2, setRound2] = useState(() => loadDailyRound(dayString));
  /**
   * Which of the day's three screens is showing.
   *
   *   game  → the angle: round one, being played or finished
   *   round2 → the construct board: round two, being played or finished
   *   final → the score
   *
   * They form a loop — final → game → round2 → final — so every screen has
   * one way on and the day can be walked round as many times as wanted. A
   * finished day opens on `final`, which is where a refresh lands.
   */
  const [view, setView] = useState(() => {
    const round1Done =
      guesses.some((entry) => entry.delta === 0) ||
      guesses.length >= MAX_GUESSES;
    return round1Done && isRoundFinished(round2) ? 'final' : 'game';
  });
  // Open for a browser that has never played, closed otherwise — until the
  // player says which they want on /settings, and then that is what is
  // remembered. Read once here: the setting is changed on another page.
  const [keyboardOpen] = useState(getInitialHelpEyeOpen);

  useEffect(() => {
    checkForConsent();
  }, []);

  const deltaAngle = useMemo(
    () =>
      angle1 >= angle2 ? angle1 - angle2 : 2 * Math.PI - (angle2 - angle1),
    [angle1, angle2]
  );
  const answer = useMemo(() =>
    Math.round((180 / Math.PI) * deltaAngle, [deltaAngle])
  );

  useEffect(() => {
    if (Math.round(answer) === Math.round(guesses[guesses.length - 1]?.value)) {
      setWin(true);
      setEnd(true);
      return;
    }
    if (guesses.length >= MAX_GUESSES) {
      setEnd(true);
    }
  }, [guesses]);

  // The answer is revealed on the drawing itself and in the result panel
  // below it, rather than in a toast sitting on top of the game.

  // Paired with the round 2 event of the same name, this is the drop-off
  // between the daily's two rounds.
  useEffect(() => {
    if (!end) return;
    trackOncePerDay('round1', dayString, 'round_complete', {
      round: 1,
      solved: win,
      attempts: guesses.length,
    });
  }, [end, win, guesses.length, dayString]);

  const playedRound2 = Boolean(
    round2 && !round2.skipped && round2.attempts?.length > 0
  );

  // Rounds saved before reflex targets were judged correctly carry a stale
  // `solved: false`, which is what the result card and the share text read.
  useEffect(() => {
    const healed = reconcileDailyRound(dayString, Math.round(answer));
    if (healed) setRound2(healed);
  }, [dayString, answer]);

  const handleGuess = (e) => {
    const parsed = parseGuess(guess);
    if (!parsed.ok) {
      toast(
        parsed.reason === EMPTY
          ? 'Enter an angle first'
          : 'Valid angles: 0° - 360°',
        { autoClose: 2000 }
      );
      return;
    }
    const value = parsed.value;
    addGuess({
      value,
      delta: value - Math.round(answer),
    });
    // Only the dial keeps its value: the next turn of it is usually a small
    // correction. A typed guess must clear, or the next digits land on the end
    // of the old ones — 42 then 5 became 425.
    setGuess(isMobile && keyboardOpen ? String(value) : '');
    if (isMobile && value !== Math.round(answer)) buzzWrongGuess();
    try {
      const guesses = JSON.parse(localStorage.getItem('guesses'));
      setData('guesses', guesses);
    } catch (e) {}
  };

  const handleEnter = (e) => {
    if (e.keyCode === 13) {
      handleGuess();
    }
  };

  return (
    <>
      {!user?.premiumGames?.includes('angle') && (
        <>
          <div id="adngin-top_banner-0"></div>
          <div id="adngin-video-0"></div>
          <div id="adngin-adhesion-0"></div>
        </>
      )}
      <Main>
        <BigContainer>
          <AccountsUpdateComponent />
          <ToastContainer
            hideProgressBar
            position="top-center"
            transition={Flip}
            autoClose={false}
          />
          <ScrollingBlackFridayPrompt />
          <NavBar user={user} onHowTo={() => setHowToSignal((n) => n + 1)} />
          <HowToModal hideTrigger openSignal={howToSignal} />
          {view === 'final' ? (
            <FinalScreen
              win={win}
              guesses={guesses}
              answer={Math.round(answer)}
              dayString={dayString}
              round2={round2}
              onStartRound2={() => setView('round2')}
              onBack={() => setView('game')}
            />
          ) : (
            <>
          <RoundSteps round1Done={end} inRound2={view === 'round2'} />
          {view === 'round2' ? (
            <DailyRound
              dayString={dayString}
              target={Math.round(answer)}
              record={round2}
              onFinish={() => {
                setRound2(loadDailyRound(dayString));
                setView('final');
              }}
            />
          ) : (
            <Angle
              angle1={angle1}
              angle2={angle2}
              largeArc={deltaAngle > Math.PI}
              answer={end ? Math.round(answer) : null}
            ></Angle>
          )}
          {view === 'round2' ? null : end && !isRoundFinished(round2) ? (
            <Round2Offer>
              <StartRound2
                onClick={() => setView('round2')}
                data-testid="start-round-2"
              >
                <ArchitectureIcon />
                Round 2 · Make {Math.round(answer)}°
              </StartRound2>
              <FinishHere
                onClick={() => {
                  const skipped = { attempts: [], skipped: true };
                  saveDailyRound(dayString, skipped);
                  setRound2(skipped);
                  setView('final');
                }}
              >
                Results &amp; share
              </FinishHere>
            </Round2Offer>
          ) : end ? (
            <SeeResults
              onClick={() => setView(playedRound2 ? 'round2' : 'final')}
              data-testid="round1-next"
            >
              {playedRound2 ? 'Round 2 result \u2192' : 'See results'}
            </SeeResults>
          ) : (
            <InputArea>
              <AngleField
                // On mobile the dial keyboard is the main input, so don't pop
                // up the device keyboard on load — tapping the field still does.
                autoFocus={!isMobile}
                value={guess}
                onChange={setGuess}
                onEnter={handleEnter}
              />
              <Button onClick={handleGuess}>Guess!</Button>
            </InputArea>
          )}
          {/* Round 2 is its own task with its own feedback: round 1's tally
              and guess list would only be noise underneath it. */}
          {view !== 'round2' && (
            <>
              <Attempts>
                Attempts:{' '}
                <span>
                  {guesses.length}/{MAX_GUESSES}
                </span>
              </Attempts>
              <Guesses guesses={guesses} answer={answer} />
            </>
          )}
          {/* Below the attempts, so they stay in view while dialling — and
              gone once the round is over, rather than sitting there inert. */}
          {isMobile && !end && keyboardOpen && (
            <DialKeyboard value={guess} onChange={setGuess} />
          )}
            </>
          )}
          {!user?.premiumGames?.includes('angle') && (
            <SidebarAd>
              <div id="adngin-sidebar_left-0"></div>
            </SidebarAd>
          )}
          <AdContainer>
            <Attribution />
            <div style={{ textAlign: 'center' }}>
              <a href="/privacy-policy/" style={{ color: '#df6347' }}>
                Privacy Policy
              </a>{' '}
              -{' '}
              <div
                id="ccpa"
                style={{
                  textAlign: 'center',
                  cursor: 'pointer',
                  display: 'none',
                }}
              >
                Do not share my Personal Information.
              </div>
            </div>
            <AdSpace />
          </AdContainer>
        </BigContainer>
      </Main>
    </>
  );
}

export default App;
