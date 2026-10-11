import styled from 'styled-components';

const GuessLine = styled.div`
  display: grid;
  grid-template-columns: repeat(6, minmax(30px, 2.5rem));
  margin: 0px 2px 2px 2px;
  margin-bottom: ${(props) => props.marginBottom};
`;
const AngleGuess = styled.div`
  display: flex;
  position: relative;
  background-color: #dddddd;
  border-radius: 3px;
  grid-column: 1 / span 2;
  margin-right: 2px;
  align-items: center;
  justify-content: center;
  @media (prefers-color-scheme: dark) {
    background-color: #1f2023;
    color: #dadada;
  }
`;

const ArrowBox = styled.div`
  display: flex;
  padding: 0.25rem;
  position: relative;
  background-color: #dddddd;
  border-radius: 3px;
  grid-column: 3 / span 1;
  margin-right: 2px;
  align-items: center;
  justify-content: center;
  @media (prefers-color-scheme: dark) {
    background-color: #1f2023;
    color: #dadada;
  }
`;

const Hint = styled.div`
  display: flex;
  padding: 0.25rem;
  position: relative;
  background-color: #dddddd;
  border-radius: 3px;
  grid-column: 4 / span 3;
  align-items: center;
  justify-content: center;
  @media (prefers-color-scheme: dark) {
    background-color: #1f2023;
    color: #dadada;
  }
`;

/**
 * How close a guess was, in words. Exported so the whole 0–360 range can be
 * swept in a test rather than sampled by hand — see Guesses.test.js.
 */
export const temperature = (guess, answer) => {
  const diff = Math.abs(answer - guess);
  if (diff === 0) {
    return '🎉🎉🎉';
  }
  if (diff < 5) {
    return 'Boiling!🔥';
  } else if (diff < 10) {
    return 'Hot!';
  } else if (diff < 20) {
    return 'Getting Hot';
  } else if (diff < 50) {
    return 'Warm';
  } else if (diff < 100) {
    return 'Cold!';
  } else {
    return 'Freezing!🥶';
  }
};

/** Which way the answer lies from a guess. 🥳 when there is no way to go. */
export const arrow = (guess, answer) => {
  if (answer === guess) return '🥳';
  return answer > guess ? '⬆️' : '⬇️';
};

export function Guesses({ guesses, answer }) {
  return guesses.map((guess, index) => (
    <GuessLine key={index}>
      <AngleGuess>{guess.value}°</AngleGuess>
      <ArrowBox>{arrow(guess.value, answer)}</ArrowBox>
      <Hint>{temperature(guess.value, answer)}</Hint>
    </GuessLine>
  ));
}
