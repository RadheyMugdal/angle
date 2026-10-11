import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import styled from 'styled-components';
import { Guesses } from './Guesses';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { Angle } from './Angle';

const StyledBox = styled(Box)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: -webkit-fill-available;
  height: auto;
  max-width: 350px;
  min-width: 250px;
  max-height: 400px;
  overflow: auto;
  background-color: #fff;
  border: 2px solid #000;
  box-shadow: 24rem;
  padding: 2em;
  justify-content: flex-start;
  @media (prefers-color-scheme: dark) {
    background-color: #121212;
    color: white;
  }
`;

const Button = styled.button`
  background: none;
  border: none;
  font-size: 1.6rem;
  cursor: pointer;
`;

const StyledModal = styled(Modal)`
  /* overflow: auto; */
  @media (prefers-color-scheme: dark) {
    color: #000;
  }
`;

const CenterDiv = styled.div`
  display: ${(props) => props.display};
  justify-content: center;
`;

const HelpIcon = styled(HelpOutlineIcon)`
  color: #df6247;
`;

/**
 * `hideTrigger` drops the built-in button (the nav menu opens this instead),
 * and bumping `openSignal` opens the modal from there.
 */
export function HowToModal({ hideTrigger, openSignal }) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    if (openSignal) setOpen(true);
  }, [openSignal]);

  const guesses = [{ value: 50 }, { value: 73 }, { value: 62 }];
  const answer = 65;

  return (
    <div>
      {!hideTrigger && (
        <Button onClick={handleOpen}>
          <HelpIcon />
        </Button>
      )}
      <StyledModal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        sx={{ zIndex: 10000 }}
      >
        <StyledBox>
          <Box>
            <IconButton
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Typography id="modal-modal-title" variant="h5" component="h2">
            How to play!
          </Typography>
          <Typography id="modal-modal-paragraph" component="p">
            Guess the Angle in 4 guesses or less!
          </Typography>
          <Typography id="modal-modal-paragraph" component="p">
            Each time you make a guess it will tell you how close you are and
            which direction to go.
          </Typography>
          <br />
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Example:
          </Typography>
          <CenterDiv display="flex">
            <Angle angle1={120 + answer} angle2={120} largeArc={false} />
          </CenterDiv>
          <CenterDiv display="grid">
            <Guesses guesses={guesses} answer={answer} />
          </CenterDiv>
          <br />
          <Typography id="modal-modal-paragraph" component="p">
            The hint tells you how warm your guess was and the arrow tells you
            to guess higher or lower.
          </Typography>
          <Typography id="modal-modal-paragraph" component="p">
            The answer in this case was:
          </Typography>
          <br />
          <CenterDiv display="grid">
            <Guesses guesses={[{ value: answer }]} answer={answer} />
          </CenterDiv>
        </StyledBox>
      </StyledModal>
    </div>
  );
}
