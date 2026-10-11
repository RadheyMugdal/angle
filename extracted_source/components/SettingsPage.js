import { useState } from 'react';
import styled from 'styled-components';
import { PageShell } from './PageShell';
import { Angle } from './Angle';
import { ANGLE_STYLES, readAngleStyle, writeAngleStyle } from '../angleStyle';
import { getInitialHelpEyeOpen, writeHelpEyeOpen } from '../helpEye';
import { readVibration, writeVibration } from '../vibration';

/**
 * `/settings` — the handful of choices a player can make about how the game
 * looks and how they enter a guess.
 *
 * Everything here is stored per browser and read when the game page loads, so
 * a change applies the next time the board is on screen. Nothing is sent
 * anywhere and nothing depends on an account.
 */

const SectionLabel = styled.h2`
  margin: 1.4rem 0 0.5rem;
  font-family: 'Boston-Regular';
  font-size: 0.78rem;
  font-weight: 400;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #8b93a1;
`;

const Card = styled.div`
  padding: 1rem 1.1rem 1.15rem;
  border-radius: 14px;
  background-color: #f7f8f9;
  @media (prefers-color-scheme: dark) {
    background-color: #1b1c1f;
  }
`;

const Name = styled.div`
  font-family: 'Boston-Regular';
  font-size: 1.05rem;
`;

const Note = styled.div`
  margin-top: 2px;
  font-size: 0.85rem;
  line-height: 1.35;
  color: #6b7280;
  @media (prefers-color-scheme: dark) {
    color: #9aa0a8;
  }
`;

/** Two or three plainly-labelled buttons, one of them on. */
const Choice = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 0.85rem;
`;

const Option = styled.button`
  flex: 1;
  padding: 0.55rem 0.6rem;
  border: 1px solid
    ${({ $on }) => ($on ? '#df6247' : 'rgba(139, 147, 161, 0.35)')};
  border-radius: 10px;
  font-family: 'Boston-Regular';
  font-size: 0.95rem;
  color: ${({ $on }) => ($on ? '#ffffff' : 'inherit')};
  background-color: ${({ $on }) => ($on ? '#df6247' : 'transparent')};
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  :hover {
    border-color: #df6247;
  }
`;

const Previews = styled.div`
  display: flex;
  gap: 7px;
  margin-top: 0.9rem;
`;

const Preview = styled.button`
  flex: 1;
  min-width: 0;
  padding: 0.35rem 0.25rem 0.5rem;
  border: 1px solid
    ${({ $on }) => ($on ? '#df6247' : 'rgba(139, 147, 161, 0.35)')};
  border-radius: 12px;
  background-color: ${({ $on }) => ($on ? 'rgba(223, 98, 71, 0.08)' : 'transparent')};
  font-family: 'Boston-Regular';
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  :hover {
    border-color: #df6247;
  }
`;

const PreviewLabel = styled.div`
  font-size: 0.88rem;
  color: ${({ $on }) => ($on ? '#df6247' : 'inherit')};
`;

const PreviewNote = styled.div`
  margin-top: 1px;
  font-size: 0.72rem;
  color: #8b93a1;
`;

/** Only shown while the dial is on: with no dial there is nothing to tick. */
const Nested = styled.div`
  margin-top: 1rem;
  padding-top: 0.9rem;
  border-top: 1px solid rgba(139, 147, 161, 0.25);
`;

/** A 135° angle: wide enough for the arc across the tips to be worth looking at. */
const SAMPLE = { angle1: 1.178, angle2: -1.178 };

export function SettingsPage() {
  const [dial, setDial] = useState(getInitialHelpEyeOpen);
  const [buzz, setBuzz] = useState(readVibration);
  const [style, setStyle] = useState(readAngleStyle);

  const chooseDial = (on) => {
    setDial(on);
    writeHelpEyeOpen(on);
  };

  const chooseBuzz = (on) => {
    setBuzz(on);
    writeVibration(on);
  };

  const chooseStyle = (value) => {
    setStyle(value);
    writeAngleStyle(value);
  };

  return (
    <PageShell>
      <SectionLabel>Entering a guess</SectionLabel>
      <Card>
        <Name>Dial keyboard</Name>
        <Note>
          The rotary dial under the board, for setting an angle by turning it
          rather than typing. Phones only — a keyboard is quicker on a computer.
        </Note>
        <Choice role="group" aria-label="Dial keyboard">
          <Option
            $on={dial}
            onClick={() => chooseDial(true)}
            data-testid="dial-on"
          >
            On
          </Option>
          <Option
            $on={!dial}
            onClick={() => chooseDial(false)}
            data-testid="dial-off"
          >
            Off
          </Option>
        </Choice>

        {dial && (
          <Nested>
            <Name>Vibration</Name>
            <Note>
              A tick as each number clicks past the marker, and three short
              buzzes for a wrong guess. Android only — iPhones ignore it.
            </Note>
            <Choice role="group" aria-label="Vibration">
              <Option
                $on={buzz}
                onClick={() => chooseBuzz(true)}
                data-testid="buzz-on"
              >
                On
              </Option>
              <Option
                $on={!buzz}
                onClick={() => chooseBuzz(false)}
                data-testid="buzz-off"
              >
                Off
              </Option>
            </Choice>
          </Nested>
        )}
      </Card>

      <SectionLabel>The drawing</SectionLabel>
      <Card>
        <Name>Angle design</Name>
        <Note>
          How the arc across the ends of the two arms is drawn. It is there so a
          reflex angle is not mistaken for the smaller one on the other side.
        </Note>
        <Previews role="group" aria-label="Angle design">
          {ANGLE_STYLES.map((option) => (
            <Preview
              key={option.value}
              $on={style === option.value}
              onClick={() => chooseStyle(option.value)}
              data-testid={`style-${option.value}`}
            >
              <Angle
                angle1={SAMPLE.angle1}
                angle2={SAMPLE.angle2}
                largeArc={false}
                tipStyle={option.value}
              />
              <PreviewLabel $on={style === option.value}>
                {option.label}
              </PreviewLabel>
              <PreviewNote>{option.note}</PreviewNote>
            </Preview>
          ))}
        </Previews>
      </Card>
    </PageShell>
  );
}
