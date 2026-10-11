import styled from 'styled-components';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';

/**
 * The Teuteuf social accounts, in Angle's own palette rather than three
 * competing brand colours.
 *
 * Facebook and Instagram are glyph icons that take `currentColor`. TikTok has
 * no icon in the set, so its existing monochrome asset is used as a mask and
 * painted the same way — same result, no new artwork, and both colour schemes
 * work without a filter hack.
 */

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px 4px;
`;

const IconLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  color: #8b93a1;
  background-color: #f2f3f5;
  transition:
    color 150ms ease,
    background-color 150ms ease;
  -webkit-tap-highlight-color: transparent;
  svg {
    font-size: 1.2rem;
  }
  :hover {
    color: #df6247;
    background-color: rgba(223, 98, 71, 0.12);
  }
  @media (prefers-color-scheme: dark) {
    color: #b9bec6;
    background-color: #26282d;
    :hover {
      color: #df6247;
      background-color: rgba(223, 98, 71, 0.18);
    }
  }
`;

/** The asset is a solid glyph, so its alpha makes a clean mask. */
const TikTokMark = styled.span`
  display: block;
  width: 17px;
  height: 17px;
  background-color: currentColor;
  -webkit-mask: url('/tiktok.svg') no-repeat center / contain;
  mask: url('/tiktok.svg') no-repeat center / contain;
`;

const SOCIALS = [
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/teuteufgames/',
    icon: <FacebookIcon />,
  },
  {
    name: 'TikTok',
    url: 'https://www.tiktok.com/@teuteufgames',
    icon: <TikTokMark />,
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/teuteufgames',
    icon: <InstagramIcon />,
  },
];

export function SocialLinks() {
  return (
    <Row>
      {SOCIALS.map((social) => (
        <IconLink
          key={social.name}
          href={social.url}
          target="_blank"
          rel="noreferrer"
          aria-label={social.name}
        >
          {social.icon}
        </IconLink>
      ))}
    </Row>
  );
}
