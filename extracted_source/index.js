import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AccountPage } from './components/AccountPage';
import { TeuteufGamesPage } from './components/TeuteufGamesPage';
import { SettingsPage } from './components/SettingsPage';
import { StatsPage } from './components/StatsPage';
import { ConstructPage } from './components/Construct/ConstructPage';
import reportWebVitals from './reportWebVitals';
import './fonts/BostonRegular.woff';

const path = window.location.pathname.replace(/\/+$/, '');

const page = () => {
  if (path === '/account') return <AccountPage />;
  if (path === '/teuteuf-games') return <TeuteufGamesPage />;
  if (path === '/stats') return <StatsPage />;
  if (path === '/construct') return <ConstructPage />;
  if (path === '/settings') return <SettingsPage />;
  return <App />;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode>{page()}</React.StrictMode>);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
