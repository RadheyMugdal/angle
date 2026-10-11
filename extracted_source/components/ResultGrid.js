import styled from 'styled-components';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CheckIcon from '@mui/icons-material/Check';
import { getGuessRows, SQUARES_PER_ROW } from '../share';

/**
 * The round replayed as rows: the arrow the game gave you, then squares for
 * how close that guess was — the same warm/cold scale as the hints.
 *
 * Drawn with elements rather than emoji, so it looks identical on every device
 * regardless of which emoji font is installed. The emoji version is built in
 * share.js, for the text that leaves the app.
 */

const Rows = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: ${({ $center }) => ($center ? 'center' : 'flex-start')};
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Arrow = styled.span`
  display: inline-flex;
  width: 1.1rem;
  justify-content: center;
  color: ${({ $solved }) => ($solved ? '#3fa96a' : '#8b93a1')};
  svg {
    font-size: 1.05rem;
  }
`;

const Squares = styled.span`
  display: inline-flex;
  gap: 4px;
`;

const Square = styled.span`
  width: 17px;
  height: 17px;
  border-radius: 4px;
  background-color: ${({ $state }) =>
    $state === 'solved'
      ? '#3fa96a'
      : $state === 'near'
        ? '#df6247'
        : '#dfe1e5'};
  @media (prefers-color-scheme: dark) {
    background-color: ${({ $state }) =>
      $state === 'solved'
        ? '#3fa96a'
        : $state === 'near'
          ? '#df6247'
          : '#33363b'};
  }
`;

export function ResultGrid({ guesses, center }) {
  return (
    <Rows $center={center}>
      {getGuessRows(guesses).map((row, index) => (
        <Row key={index}>
          <Arrow $solved={row.direction === 'solved'}>
            {row.direction === 'solved' ? (
              <CheckIcon />
            ) : row.direction === 'up' ? (
              <ArrowUpwardIcon />
            ) : (
              <ArrowDownwardIcon />
            )}
          </Arrow>
          <Squares>
            {Array.from({ length: SQUARES_PER_ROW }, (unused, i) => (
              <Square
                key={i}
                $state={
                  i >= row.filled
                    ? 'empty'
                    : row.direction === 'solved'
                      ? 'solved'
                      : 'near'
                }
              />
            ))}
          </Squares>
        </Row>
      ))}
    </Rows>
  );
}
