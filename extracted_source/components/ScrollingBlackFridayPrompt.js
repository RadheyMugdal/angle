import { useEffect, useState } from 'react';
import { ScrollingTopBanner } from '@teuteuf-games/scrolling-top-banner';
import { useLocalStorage } from 'usehooks-ts';
import dayjs from 'dayjs';
import useUser from '../hooks/useUser';

/**
 * A wrapper component for ScrollingTopBanner configured specifically for black friday 2025 sale prompts.
 */
const ScrollingBlackFridayPrompt = () => {
  const [closedDates, setClosedDates] = useLocalStorage(
    'scrolling-black-friday-2025-prompt-closed-dates',
    []
  );
  const [hidden, setHidden] = useState(true);
  const { userDetails } = useUser();

  const handleClose = () => {
    setHidden(true);
    const now = new Date().toISOString();
    setClosedDates((prev) => [...prev, now]);
  };

  const handleClick = () => {
    window.open('https://account.teuteuf.fr/premium-sign-up', '_blank');
  };

  // show banner Monday Nov 24th
  // if banner has been closed, we never show again
  useEffect(() => {
    if (!dayjs().isSame(dayjs('2025-11-24'), 'day')) {
      return setHidden(true);
    }
    if (userDetails?.premiumGames?.length) return setHidden(true); // hide if premium
    if (closedDates.length > 0) return setHidden(true); // hide if closed before
    return setHidden(false);
  }, [closedDates, userDetails?.premiumGames]);

  if (hidden) return null;

  return (
    <ScrollingTopBanner
      bannerText={[
        'black friday is here',
        '40% off all premium plans',
        'play without ads',
        'access the archives',
        'use code blackfriday25',
      ]}
      onClick={handleClick}
      onClose={handleClose}
      bgColor="#1A1A1A"
    />
  );
};

export default ScrollingBlackFridayPrompt;
