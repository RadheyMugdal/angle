import styled from 'styled-components';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { LoginPage } from '@teuteuf-games/login-page';
import { Attribution } from './Attribution';
import useUser from '../hooks/useUser';

const isLocalhost =
  typeof window !== 'undefined' && window.location.origin.includes('localhost');
const AUTH_SERVER_URL = isLocalhost
  ? 'http://localhost:3000'
  : 'https://auth.teuteuf.fr';
const REFERER = isLocalhost ? 'localhost-3001' : 'angle';

const Container = styled.div`
  display: flex;
  /* Grows with its content and lets the document scroll — see index.css. */
  flex: 1 0 auto;
  width: 100%;
  justify-content: flex-start;
  flex-direction: column;
  align-items: center;
  @media (prefers-color-scheme: dark) {
    background-color: #121212;
    color: #fff;
  }
`;

const Inner = styled.div`
  width: 100%;
  max-width: 32rem;
  padding: 1rem;
  text-align: left;
`;

const BackLink = styled.a`
  color: #df6247;
  text-decoration: none;
  :hover {
    text-decoration: underline;
  }
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: bold;
  margin-top: 0.75rem;
`;

const BigButton = styled.a`
  cursor: pointer;
  color: #000;
  text-decoration: none;
  padding: 10px;
  border-radius: 10px;
  border-width: 0px;
  font-family: 'Boston-Regular';
  font-size: 1rem;
  background-color: lightgrey;
  :active,
  :hover {
    background-color: darkgrey;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 1rem;
`;

const LoginWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1rem;
`;

const HeaderButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  cursor: pointer;
`;

const LoginIcon = styled(AccountCircleIcon)`
  color: #df6247;
`;

export function AccountButton({ user }) {
  return (
    <HeaderButton href="/account" aria-label="Account">
      {!user?.photoURL && <LoginIcon />}
      {user?.photoURL && (
        <img
          src={user.photoURL}
          alt={user.firstName}
          style={{
            borderRadius: '100%',
            width: '24px',
            height: '24px',
          }}
        />
      )}
    </HeaderButton>
  );
}

export function AccountPage() {
  const { user, logout } = useUser();

  return (
    <Container>
      <Inner>
        <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
          <BackLink href="/">&#8592; Back</BackLink>
        </div>
        <Title>Your account</Title>
        {user ? (
          <>
            <p style={{ marginTop: '0.75rem' }}>Hi {user.firstName} 👋</p>
            <p style={{ marginTop: '0.5rem' }}>
              We now store your stats after each game. This not only safeguards
              your progress but also enables seamless gameplay across multiple
              devices.{' '}
              <a
                href="https://account.teuteuf.fr"
                target="_blank"
                rel="noreferrer"
                style={{ color: '#df6247' }}
              >
                Learn more
              </a>
              .
            </p>
            <ButtonRow>
              <BigButton
                as="button"
                onClick={() => {
                  logout();
                  window.location = '/';
                }}
              >
                Sign out
              </BigButton>
              <BigButton href="https://account.teuteuf.fr" target="_blank">
                Manage account
              </BigButton>
            </ButtonRow>
          </>
        ) : (
          <LoginWrapper>
            <LoginPage authServerUrl={AUTH_SERVER_URL} referer={REFERER} />
          </LoginWrapper>
        )}
        <div className="text-start text-xs py-3 mt-5">
          <p>
            You can change your privacy settings by clicking the following
            button:{' '}
            <button
              className="underline cursor-pointer"
              onClick={() => window.adconsent && window.adconsent('showGUI')}
            >
              Manage Consent
            </button>
          </p>
        </div>
        <Attribution />
      </Inner>
    </Container>
  );
}
