export function loadAds(isPremium) {
  // set active ad units
  setActiveAdUnits(isPremium);

  // load ad script
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://cdn.snigelweb.com/adengine/angle.wtf/loader.js';
  script.type = 'text/javascript';
  script.setAttribute('data-cfasync', 'false');

  if (!document.querySelector(`script[src*="adengine/angle.wtf/loader.js"]`)) {
    document.body.appendChild(script);
  }
  return script;
}

function getActiveAdUnits() {
  let breakpoint = 'xsmall';

  const w = window.innerWidth;

  breakpoint = w >= 768 ? 'small' : breakpoint;
  // Matches RAIL_FROM in adLayout.js: the sidebar is only requested from
  // the width where its container is actually visible and clear of the UI.
  breakpoint = w >= 900 ? 'medium' : breakpoint;
  breakpoint = w >= 1280 ? 'large' : breakpoint;
  breakpoint = w >= 1400 ? 'xlarge' : breakpoint;

  let activeUnits = [];

  switch (breakpoint.toLowerCase()) {
    case 'xsmall': // Small Mobile
    case 'small': // Portrait Tablet / Large Mobile
      activeUnits = ['adhesion', 'top_banner']; // Mobile Ad Units
      break;
    default:
    case 'medium':
    case 'xlarge':
    case 'large':
      activeUnits = ['sidebar_left', 'video', 'adhesion'];
      break;
  }

  window.snigelPubConf = {
    adengine: {
      activeAdUnits: activeUnits,
    },
  };
  return activeUnits;
}

function setActiveAdUnits(isPremium) {
  if (isPremium) {
    window.snigelPubConf = {
      adengine: {
        activeAdUnits: [''],
      },
    };
    return;
  }

  const activeUnits = getActiveAdUnits();

  window.snigelPubConf = {
    adengine: {
      activeAdUnits: activeUnits,
    },
  };
}

/**
 * Check for consent through Snigel, then set GA consent
 */
export const checkForConsent = () => {
  window.addEventListener('adnginLoaderReady', function () {
    window.adconsent &&
      window.adconsent('getConsent', null, function (consent, success) {
        if (success) {
          if (consent.fullConsent) {
            console.log('########### yas consent');
            window.gtag('consent', 'update', {
              ad_storage: 'granted',
              analytics_storage: 'granted',
              ad_user_data: 'granted',
              ad_personalization: 'granted',
            });
          } else {
            console.log('########### naur consent');
            clearAnalyticsCookies();
          }
        }
      });
  });
};

function clearAnalyticsCookies() {
  const teuteufCookieNames = ['_gid'];

  // delete all _ga cookies
  document.cookie
    .split(';')
    .map((c) => c.trim())
    .forEach((cookie) => {
      const name = cookie.split('=')[0];
      if (name.startsWith('_ga')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.angle.wtf`;
      }
    });

  // delete other analytics cookies
  teuteufCookieNames.forEach((name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.angle.wtf`;
  });
}
