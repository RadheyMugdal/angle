import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { loadAds } from '../ads';

let SERVER_URL = '';

if (typeof window !== 'undefined') {
  if (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  ) {
    SERVER_URL = 'http://localhost:3000';
  } else {
    SERVER_URL = 'https://auth.teuteuf.fr';
  }
}

async function refreshTokens() {
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');
  if (!token || !refreshToken) {
    // No token found
    console.log('No token found');
    return;
  }
  const refreshTime = localStorage.getItem('refreshTime');
  if (refreshTime) {
    const refreshDate = new Date(+refreshTime);
    const today = new Date();
    if (
      refreshDate.getDate() === today.getDate() &&
      refreshDate.getMonth() === today.getMonth() &&
      refreshDate.getFullYear() === today.getFullYear()
    ) {
      // Tokens already refreshed today
      console.log('Tokens already refreshed today');
      return;
    }
  }

  // Make a request to refresh the token
  const response = await axios.post(`${SERVER_URL}/auth/refresh`, {
    token,
    refreshToken,
  });
  try {
    if (response?.data) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('refreshTime', Date.now());
    }
  } catch (e) {
    console.error(e);
  }
}

async function getUser() {
  const token = localStorage.getItem('token');
  if (token) {
    // Fetch user data...make request
    try {
      const response = await axios.get(`${SERVER_URL}/api/getuser`, {
        headers: { Authorization: 'Bearer ' + token },
      });
      const user = response.data;
      return user;
    } catch (e) {}
  }
  return null;
}

async function getData(key) {
  const token = localStorage.getItem('token');
  if (!token) {
    return null;
  }
  try {
    const response = await axios.post(
      `${SERVER_URL}/api/getdata`,
      {
        gameId: 'angle',
        key,
      },
      {
        headers: { Authorization: 'Bearer ' + token },
      }
    );
    if (response.data?.value) {
      return response.data.value;
    }
  } catch (e) {}
  return null;
}

async function setData(key, value) {
  const token = localStorage.getItem('token');
  if (!token) {
    return false;
  }
  try {
    const response = await axios.post(
      `${SERVER_URL}/api/setdata`,
      {
        gameId: 'angle',
        key,
        value,
      },
      {
        headers: { Authorization: 'Bearer ' + token },
      }
    );
    if (response.data?.value) {
      return true;
    }
  } catch (e) {}
  return false;
}

export const updateSeenAccountsUpdateModal = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return null;
  }
  try {
    axios.post(
      `${SERVER_URL}/api/seenaccountsupdatemodal`,
      {},
      {
        headers: { Authorization: 'Bearer ' + token },
      }
    );
  } catch {
    return;
  }
};

export default function useUser() {
  const [user, setUser] = useState();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showAccountsUpdateModal, setShowAccountsUpdateModal] = useState(false);
  const adsScript = useRef();

  const checkToShowAccountsUpdateModal = () => {
    const storedSeenModal = localStorage.getItem('accounts-update-modal');
    if (storedSeenModal !== 'true' && Date.now() < 1747348430000) {
      setShowAccountsUpdateModal(true);
      localStorage.setItem('accounts-update-modal', 'true');
      updateSeenAccountsUpdateModal();
    }
    return;
  };

  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    if (adsScript.current) {
      // Ads already loaded
      return;
    }
    adsScript.current = loadAds(user?.premiumGames?.includes('angle'));
  }, [isLoaded, user]);

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('refreshTime');
    localStorage.removeItem('teuteufUser');
    setUser(null);
  }

  useEffect(() => {
    if (localStorage.getItem('teuteufUser')) {
      setUser(JSON.parse(localStorage.getItem('teuteufUser')));
    }

    (async () => {
      // If hash is of the form `#userData=...`, then we have a user data hash
      const hash = window.location.hash;
      if (hash.startsWith('#userData=')) {
        // Extract user data
        const { token, refreshToken } = JSON.parse(
          decodeURIComponent(hash.substring('#userData='.length))
        );
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('refreshTime', Date.now());

        // save token + refresh token + user data
        window.location = '/';
      }

      await refreshTokens();
      const user = await getUser();
      if (user) {
        setUser(user);
        setIsLoaded(true);
        localStorage.setItem('teuteufUser', JSON.stringify(user));

        try {
          const localData = JSON.parse(localStorage.getItem('guesses')) ?? {};
          const data = await getData('guesses');
          if (data) {
            // Merge into local storage
            let changed = false;
            for (const date in data) {
              if (!localData.hasOwnProperty(date)) {
                localData[date] = data[date];
                changed = true;
              }
            }
            if (changed) {
              localStorage.setItem('guesses', JSON.stringify(localData));
            }
          }

          let shouldUpload = false;
          for (const date in localData) {
            if (!data || !data.hasOwnProperty(date)) {
              shouldUpload = true;
              break;
            }
          }

          if (shouldUpload) {
            await setData('guesses', localData);
          }
        } catch (e) {
          console.error('Unable to sync data');
        }
        if (!user.seenAccountsUpdateModal) {
          // checkToShowAccountsUpdateModal(true);
        }
      } else {
        setIsLoaded(true);
        // checkToShowAccountsUpdateModal();
      }
    })();
  }, []);

  // show ads iff not premium
  return {
    user,
    setData,
    logout,
    showAccountsUpdateModal,
  };
}
