import styled from 'styled-components';

/**
 * "Brought to you by Worldle", in the footer of every page — the same
 * attribution the other Teuteuf games carry.
 *
 * The logo is served from our own `public/images` (copied from the Teuteuf
 * asset CDN) so a footer on every page never waits on a third-party request.
 */

const WORLDLE_URL =
  'https://worldle.teuteuf.fr/?utm_source=angle&utm_medium=referral&utm_campaign=branding';

const Link = styled.a`
  display: block;
  width: fit-content;
  /* Centred under a page; tucked into the gutter inside the nav menu. */
  margin: ${({ $align }) =>
    $align === 'left' ? '4px 0 0' : '1.25rem auto 0.75rem'};
  padding: ${({ $align }) => ($align === 'left' ? '2px 16px' : '2px 4px')};
  text-align: left;
  text-decoration: none;
  color: #6b7280;
  transition: opacity 150ms ease;
  :hover {
    opacity: 0.7;
  }
  @media (prefers-color-scheme: dark) {
    color: #9aa0a8;
  }
`;

const Caption = styled.span`
  display: block;
  font-size: 0.72rem;
  line-height: 1.2;
`;

const Brand = styled.span`
  display: flex;
  align-items: center;
  justify-content: ${({ $align }) =>
    $align === 'left' ? 'flex-start' : 'center'};
  gap: 5px;
  margin-top: 3px;
`;

const Logo = styled.img`
  width: 16px;
  height: 16px;
  flex: none;
`;

const Name = styled.span`
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: #2d2d2d;
  @media (prefers-color-scheme: dark) {
    color: #dadada;
  }
`;

export function Attribution({ align = 'center' }) {
  return (
    <Link href={WORLDLE_URL} target="_blank" rel="noreferrer" $align={align}>
      <Caption>Brought to you by:</Caption>
      <Brand $align={align}>
        <Logo src="/images/worldle.svg" alt="" width="16" height="16" />
        <Name>Worldle</Name>
      </Brand>
    </Link>
  );
}
